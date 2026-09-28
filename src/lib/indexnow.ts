const INDEXNOW_KEY = "cdbb17d3ba4605c01feb2fb2643330ac";
const HOST = "rakhuno.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const DEFAULT_URLS = [
  "https://rakhuno.com/",
  "https://rakhuno.com/invoice",
  "https://rakhuno.com/guides",
  "https://rakhuno.com/guides/rahunok-faktura",
  "https://rakhuno.com/guides/zrazok-rahunku-faktury",
  "https://rakhuno.com/guides/rahunok-onlayn",
  "https://rakhuno.com/guides/fop-3-grupa",
  "https://rakhuno.com/guides/yedynyy-podatok",
  "https://rakhuno.com/guides/podatky-fop",
];

/** Ping IndexNow (Bing & partners). Google uses GSC separately. */
export async function submitIndexNow(urls: string[] = DEFAULT_URLS) {
  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  return {
    ok: res.ok || res.status === 202,
    status: res.status,
    submitted: urls.length,
  };
}
