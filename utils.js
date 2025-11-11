
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
  const namaProduk = getValueFromPath(jsonData, "feResponse.data.namaProduk");
  switch (namaProduk) {
    case "GADAI KCA":
      return "01";
    case "KREASI":
      return "03";
    case "KRASIDA":
      return "04";
    case "GADAI PRIMA":
      return "06";
    case "KREASI ULTRA MIKRO":
      return "07";
    case "MULIA":
      return "09";
    case "GADAI BISNIS":
      return "11";
    case "GADAI FLEKSI":
      return "12";
    case "GADAI AGEN":
      return "13";
    case "AMANAH":
      return "15";
    case "ARRUM HAJI":
      return "17";
    case "RAHN TASJILY TANAH":
      return "18";
    case "ARRUM SAFAR":
      return "19";
    case "ARRUM HAJI TABUNGAN EMAS":
      return "25";
    case "EMASKU":
      return "29";
    case "PINJAMAN MODAL KERJA":
      return "30";
    case "GADAI KCA KHUSUS":
      return "31";
    case "GADAI TABUNGAN EMAS":
      return "32";
    case "KRASIDA KHUSUS":
      return "34";
    case "KRASIDA TABUNGAN EMAS":
      return "35";
    case "GADAI EFEK":
      return "36";
    case "MULIA ULTIMATE":
      return "37";
    case "EMASKU ULTIMATE":
      return "38";
    case "MULIA BARU":
      return "39";
    case "GADAI TABUNGAN EMAS PRIMA":
      return "42";
    case "GADAI TITIPAN EMAS":
      return "43";
    case "MITRA GADAI":
      return "44";
    case "KREASI EXPRESS LOAN":
      return "47";
    case "PINJAMAN MODAL PRODUKTIF":
      return "48";
    case "TABUNGAN EMAS":
      return "62";
    case "TABUNGAN CHANNEL":
      return "65";
    case "MULIA TABUNGAN EMAS":
      return "67";
    case "TABUNGAN EMAS PLUS":
      return "69";
    case "ARRUM EKSPRESS LOAN":
      return "76";
    case "KREASI MULTI GUNA":
      return "77";
    case "MULIA EXPRESS":
      return "88";
    case "KUPEDES PEGADAIAN":
      return "89";
    default:
      return "";
  }
};
