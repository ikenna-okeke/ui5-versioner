const VERSION_JSON_URL = "https://ui5.sap.com/version.json";

async function getUi5Versions() {
  const response = await fetch(VERSION_JSON_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch UI5 versions. HTTP ${response.status}`
    );
  }

  return response.json();
}

async function getLatestUi5Version() {
  const data = await getUi5Versions();
  return data.latest.version;
}

async function getLatestLtsUi5Version() {
  const data = await getUi5Versions();

  const ltsVersions = Object.values(data)
    .filter(
      item =>
        item &&
        typeof item === "object" &&
        item.lts === true
    )
    .map(item => item.version)
    .sort(compareVersions);

  return ltsVersions[ltsVersions.length - 1];
}

function compareVersions(a, b) {
  const av = a.split(".").map(Number);
  const bv = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const diff = av[i] - bv[i];

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

module.exports = {
  getLatestUi5Version,
  getLatestLtsUi5Version
};