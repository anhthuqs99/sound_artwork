import { setContract, getData } from "./sound.js";

const IPFS_PREFIX = "https://ipfs.test.bitmark.com/ipfs/";
const AUDIO_ELEMENT = document.getElementById("audio");
const PLAY_ALL_BUTTON_ELEMENT = document.getElementById("play-all");

let recordsData = [];
let numberOfRecord = recordsData.length;
let latestRecord = {};
let isPlayingAudio = false;
let isPlayAllAudio = false;
let currentPlayingIndex = -1;
let currentAudioDuration = 0;

/**
 * Initializes the script by fetching data from a contract and creating records.
 */
async function initialize() {
  try {
    const { contractAddress, tokenID, rpcEndpoint } = getQueryParams();
    let records;
    if (contractAddress && tokenID) {
      await setContract(rpcEndpoint);
      records = await getData(contractAddress, tokenID);
    }

    // Handle records if any, else handle no records scenario
    records && records.length > 0
      ? handleRecordsData(records)
      : handleNoRecordsData();
  } catch (error) {
    console.log("Initialization failed:", error);
  }
}
/**
 * Get the contract address and token ID from the URL query parameters
 */
function getQueryParams() {
  const searchParams = new URLSearchParams(location.search);
  return {
    contractAddress: searchParams.get("contract"),
    tokenID: searchParams.get("token_id"),
    rpcEndpoint: searchParams.get("rpc_endpoint"),
  };
}

function handleRecordsData(records) {
  records.forEach((data) => recordsData.push(formatDataFromContract(data)));
  recordsData.sort(
    (a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt)
  );
  latestRecord = recordsData[0];
  numberOfRecord = recordsData.length;
  createRecordsTable(recordsData);
  createListenLatestRecordElement();
}

function createListenLatestRecordElement() {
  const listenLatestRecordElement = document.createElement("div");
  listenLatestRecordElement.innerHTML = `<span id="duration-1" class="duration hidden"></span>
                                        <button id="button-1" onclick="playLatestRecord()">[Listen]</button>`;
  document.getElementById("bottomGroup").appendChild(listenLatestRecordElement);
}

function handleNoRecordsData() {
  const emptyData = document.createElement("div");
  emptyData.classList.add("empty-data");
  emptyData.textContent = "No laughter recorded yet. Check back soon.";
  document.getElementById("records-table").appendChild(emptyData);
  PLAY_ALL_BUTTON_ELEMENT.style.display = "none";
}

/**
 * Formats the data received from a contract.
 *
 * @param {Object} data - The data object received from the contract.
 * @returns {Object} - The formatted data object.
 */
function formatDataFromContract(data) {
  const cid = Web3.utils.toAscii(data.dataHash).replace("/\u0000/g", "");
  const formatData = {
    owner: data.owner,
    dataHash: cid,
    metadata: JSON.parse(data.metadata.toString()),
  };
  // Convert from millisecond to second
  formatData.metadata.duration = Number(formatData.metadata.duration) / 1000;
  return formatData;
}

/**
 * Creates records in the table based on the provided array of records.
 * @param {Array} records - Formatted records data from contract.
 */
function createRecordsTable(records) {
  const recordsTable = document.getElementById("records-table");
  const playAllButton = PLAY_ALL_BUTTON_ELEMENT;
  playAllButton.textContent = "[Play All]";

  for (const [index, record] of records.entries()) {
    const tr = createRecordRow(index, record);
    // Append tr to recordsTable
    recordsTable.appendChild(tr);
  }
}

function createRecordRow(index, record) {
  const tr = document.createElement("tr");
  tr.id = `record${index}`;

  const td1 = document.createElement("td");
  td1.textContent = formatDateTime(record.metadata.createdAt);

  const td2 = document.createElement("td");
  td2.id = `duration${index}`;
  td2.textContent = formatTimeDuration(record.metadata.duration);

  const td3 = document.createElement("button");
  td3.id = `button${index}`;
  td3.textContent = "[Play]";
  td3.onclick = audioPlayingHandler.bind(
    this,
    index,
    record.dataHash,
    record.metadata.duration
  ); // Binding click event to the audioPlayingHandler function

  tr.append(td1, td2, td3);
  return tr;
}

function formatTimeDuration(durationInSeconds) {
  durationInSeconds = Math.floor(durationInSeconds);
  const minutes = Math.floor(durationInSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (durationInSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
  const year = date.getFullYear().toString().slice(-2);
  return `${day}.${month}.${year}`;
}

function audioPlayingHandler(index, audioSource, duration) {
  console.log(currentPlayingIndex, index);
  if (currentPlayingIndex !== index) {
    stopAudio();
    currentPlayingIndex = index;
    currentAudioDuration = duration;
    isPlayingAudio = true;
    playAudio(index, audioSource);
  } else {
    isPlayingAudio = !isPlayingAudio;
    currentPlayingIndex = index;
    currentAudioDuration = duration;
    if (isPlayingAudio) {
      playAudio(index, audioSource);
    } else {
      stopAudio();
      playNextAudio();
    }
  }
}

function playAudio(index, audioSource) {
  document.getElementById(`button${index}`).textContent = "[Stop]";
  AUDIO_ELEMENT.src = `${IPFS_PREFIX}${audioSource}`;
  AUDIO_ELEMENT.play();
  console.log("Play audio with src: ", AUDIO_ELEMENT.src);
  listenEventTimeUpdate();
}

function stopAudio() {
  AUDIO_ELEMENT.pause();
  AUDIO_ELEMENT.src = "";
  removeEventTimeUpdate();
  resetAudioPlayingStatus();
}

function playLatestRecord() {
  if (latestRecord) {
    document.getElementById("duration-1").classList.remove("hidden");
    document.getElementById("duration-1").textContent =
      `00:00 - ${formatTimeDuration(latestRecord.metadata.duration)}`;
    document.getElementById("laughterButton").disabled = true;
    currentPlayingIndex = -1;
    audioPlayingHandler(
      -1,
      latestRecord.dataHash,
      latestRecord.metadata.duration
    );
  }
}

function allAudioPlayingHandler() {
  if (isPlayingAudio && !isPlayAllAudio) {
    stopAudio();
  }
  isPlayAllAudio = !isPlayAllAudio;
  if (isPlayAllAudio) {
    PLAY_ALL_BUTTON_ELEMENT.textContent = "[Stop All]";
    currentPlayingIndex = 0;
    isPlayAllAudio = true;
    audioPlayingHandler(
      0,
      recordsData[0].dataHash,
      recordsData[0].metadata.duration
    );
  } else {
    PLAY_ALL_BUTTON_ELEMENT.textContent = "[Play All]";
    stopAudio();
    currentPlayingIndex = -1;
  }
}

function resetAudioPlayingStatus() {
  isPlayingAudio = false;
  document.getElementById(`button${currentPlayingIndex}`).textContent =
    "[Play]";
  document.getElementById(`duration${currentPlayingIndex}`).textContent =
    formatTimeDuration(currentAudioDuration);
  document.getElementById("duration-1").classList.add("hidden");
  document.getElementById("laughterButton").disabled = false;
}

function playNextAudio() {
  if (isPlayAllAudio) {
    if (currentPlayingIndex < numberOfRecord - 1) {
      currentPlayingIndex++;
      audioPlayingHandler(
        currentPlayingIndex,
        recordsData[currentPlayingIndex].dataHash,
        recordsData[currentPlayingIndex].metadata.duration
      );
    } else {
      isPlayAllAudio = false;
      PLAY_ALL_BUTTON_ELEMENT.textContent = "[Play All]";
    }
  }
}

function togglePages() {
  document.getElementById("listen").classList.toggle("hidden");
  document.getElementById("laughter").classList.toggle("hidden");
  if (isPlayingAudio) {
    stopAudio();
  }
}

function listenEventTimeUpdate() {
  AUDIO_ELEMENT.addEventListener("timeupdate", () => {
    if (!isPlayingAudio) {
      return;
    }
    const currentTime = AUDIO_ELEMENT.currentTime;
    document.getElementById(`duration${currentPlayingIndex}`).textContent =
      `${formatTimeDuration(currentTime)} - ${formatTimeDuration(
        currentAudioDuration
      )}`;
    if (AUDIO_ELEMENT.currentTime >= AUDIO_ELEMENT.duration) {
      resetAudioPlayingStatus();
      playNextAudio();
    }
  });
}

function removeEventTimeUpdate() {
  AUDIO_ELEMENT.removeEventListener("timeupdate", () => {});
}

window.allAudioPlayingHandler = allAudioPlayingHandler;
window.togglePages = togglePages;
window.playLatestRecord = playLatestRecord;
initialize();
