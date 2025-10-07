
const getValueFromPath = (obj, path) => {
  if (!path || !obj) return null;
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }
  return current;
};

const toDecimalString = (value) => {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  return isFinite(numeric) ? numeric.toFixed(2) : "";
};

const toIntegerString = (value) => {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  return isFinite(numeric) ? String(Math.trunc(numeric)) : "";
};

const getKodeProduk = (jsonData) => {
  const serviceId = getValueFromPath(jsonData, "feRequest.serviceId");
  if (serviceId === "000RC" || serviceId === "000QZ") return "37";
  if (serviceId === "000U7" || serviceId === "000U8") return "32";
  return "01";
};
