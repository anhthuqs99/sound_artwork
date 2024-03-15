const IPFS_PREFIX = "https://ipfs.bitmark.com/ipfs/";
const AUDIO_ELEMENT = document.getElementById("audio");
const PLAY_ALL_BUTTON_ELEMENT = document.getElementById("play-all");
const RECORD_TABLE_ELEMENT = document.getElementById("records-table");
const LAUGHTER_BUTTON_ELEMENT = document.getElementById("laughterButton");
const CLOSE_BUTTON_ELEMENT = document.getElementById("closeButton");
const COUNT = 100;
const EXHIBITION_CONTRACT_ADDRESS =
  "0x1d9787369b1dcf709f92da1d8743c2a4b6028a83";
const TOKEN_ID = "5429577522081131997036023001590580143450575936";

let recordsData = [];
let numberOfRecord = 0;
let startIndex = 0;
let isPlayingAudio = false;
let isPlayAllAudio = false;
let currentPlayingIndex = 0;
let currentAudioDuration = 0;

/**
 * Initializes the script by fetching data from a contract and creating records.
 */
async function initialize() {
  try {
    let { contractAddress, tokenID, rpcEndpoint } = getQueryParams();
    contractAddress = contractAddress || EXHIBITION_CONTRACT_ADDRESS;
    tokenID = tokenID || TOKEN_ID;
    if (contractAddress && tokenID) {
      await setContract(rpcEndpoint);
      await fetchDataFromContract(contractAddress, tokenID, startIndex, COUNT);
      if (!recordsData || recordsData.length === 0) {
        handleNoRecordsData();
      }
    } else {
      handleNoRecordsData();
    }
  } catch (error) {
    console.log("Initialization failed:", error);
  }
}

function truncateAddress(address) {
  return `[${address.slice(0, 4)}....${address.slice(-4)}]`;
}

async function fetchDataFromContract(
  contractAddress,
  tokenID,
  startIndex,
  count
) {
  const records = await getData(contractAddress, tokenID, startIndex, count);
  if (records && records.length > 0) {
    for (const data of records) {
      const formatData = formatDataFromContract(data);
      if (formatData.dataHash) {
        recordsData.push(formatData);
        // Handle not empty records data
        if (numberOfRecord === 0) {
          handleRecordsData();
        }
        const tr = createRecordRow(numberOfRecord, formatData);
        RECORD_TABLE_ELEMENT.appendChild(tr);
        numberOfRecord++;
      }
    }

    // Detect can load more records
    startIndex += records.length;
    if (records.length >= count) {
      await fetchDataFromContract(contractAddress, tokenID, startIndex, count);
    }
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

function handleRecordsData() {
  RECORD_TABLE_ELEMENT.textContent = "";
  PLAY_ALL_BUTTON_ELEMENT.textContent = "[Play All]";
  PLAY_ALL_BUTTON_ELEMENT.onclick = allAudioPlayingHandler.bind(this);
}

function handleNoRecordsData() {
  const emptyData = document.createElement("div");
  emptyData.classList.add("empty-data");
  emptyData.textContent = "No laughter recorded yet. Check back soon.";
  RECORD_TABLE_ELEMENT.textContent = "";
  RECORD_TABLE_ELEMENT.appendChild(emptyData);
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

async function getDomainName(address) {
  try {
    const lookup = address.toLowerCase().substr(2) + ".addr.reverse";
    const ResolverContract = await web3.eth.ens.getResolver(lookup);
    const nh = namehash.hash(lookup);
    const name = await ResolverContract.methods.name(nh).call();
    if (name && name.length) {
      const verifiedAddress = await web3.eth.ens.getAddress(name);
      if (
        verifiedAddress &&
        verifiedAddress.toLowerCase() === address.toLowerCase()
      ) {
        return name;
      }
    }
    return "";
  } catch (error) {
    return "";
  }
}

function createRecordRow(index, record) {
  const tr = document.createElement("tr");
  tr.id = `record${index}`;
  const td1 = document.createElement("td");
  td1.textContent = formatDateTime(record.metadata.createdAt);
  td1.className = "td1";

  const td2 = document.createElement("td");
  td2.className = "td2";
  td2.id = `duration${index}`;
  td2.textContent = formatTimeDuration(record.metadata.duration);

  const td3 = document.createElement("button");
  td3.className = "td3";
  td3.id = `button${index}`;
  td3.textContent = "[Play]";
  td3.onclick = audioPlayingHandler.bind(
    this,
    index,
    record.dataHash,
    record.metadata.duration
  ); // Binding click event to the audioPlayingHandler function

  const td4 = document.createElement("td");
  td4.textContent = truncateAddress(record.owner);
  td4.className = "td4";
  getDomainName(record.owner).then((ownerEns) => {
    td4.textContent = ownerEns || truncateAddress(record.owner);
  });

  tr.append(td1, td4, td2, td3);
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
  const audioHandlerButton = document.getElementById(`button${index}`);
  audioHandlerButton.textContent = "[Stop]";
  audioHandlerButton.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
  AUDIO_ELEMENT.src = `${IPFS_PREFIX}${audioSource}`;
  AUDIO_ELEMENT.play();
  listenEventTimeUpdate();
}

function stopAudio() {
  AUDIO_ELEMENT.pause();
  AUDIO_ELEMENT.src = "";
  removeEventTimeUpdate();
  resetAudioPlayingStatus();
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
  }
}

function resetAudioPlayingStatus() {
  isPlayingAudio = false;
  document.getElementById(`button${currentPlayingIndex}`).textContent =
    "[Play]";
  document.getElementById(`duration${currentPlayingIndex}`).textContent =
    formatTimeDuration(currentAudioDuration);
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
  isPlayAllAudio = false;
  PLAY_ALL_BUTTON_ELEMENT.textContent = "[Play All]";
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
LAUGHTER_BUTTON_ELEMENT.onclick = togglePages.bind(this);
CLOSE_BUTTON_ELEMENT.onclick = togglePages.bind(this);
initialize();
