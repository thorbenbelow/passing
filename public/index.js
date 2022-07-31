const params = new URLSearchParams(window.location.search)


if (params.has("s")) {
  reveal()
} else {
  create()
}

function create() {
  const form = document.getElementById("secretForm")
  form.addEventListener("submit", sendSecret)

  document.getElementById("create").classList.remove("hidden")
}

function reveal() {
  document.getElementById("reveal").classList.remove("hidden")
  document.getElementById("revealForm").addEventListener("submit", revealSecret)
}

async function sendSecret(evt) {
  evt.preventDefault()

  const secret = document.getElementById("secretInput").value
  const { rawKey, uuid, hash, counter } = await encryptSecret(secret)

  await fetch("/pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ uuid, hash, counter })
  })

  const path = `${uuid}:${rawKey}`
  
  document.getElementById("urlAlert").classList.remove("hidden")
  document.getElementById("urlInput").value = `${window.location.host}?s=${path}`

  return false
}

async function revealSecret(evt) {
  evt.preventDefault()
  const split = params.get("s").indexOf(":")
  const id = params.get("s").substring(0, split)
  const rawKey = params.get("s").substring(split+1)
  const res = await fetch(`/pass?id=${encodeURIComponent(id)}`, { method: 'GET' })
  const { hash, counter } = await res.json()

  const secret = await decryptSecret(rawKey, hash, counter)
  console.log(secret)
  document.getElementById("secretContainer").value = secret

  return false
}

async function encryptSecret(secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-CTR",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  const uuid = crypto.randomUUID()
  const counter = crypto.getRandomValues(new Uint8Array(16))

  const buff = await crypto.subtle.encrypt(
    {
      name: "AES-CTR",
      length: 64,
      counter
    },
    key,
    encoder.encode(secret)
  );

  const exported = await crypto.subtle.exportKey("raw", key)
  const hash = JSON.stringify(new Uint8Array(buff))
  const rawKey = JSON.stringify(new Uint8Array(exported))

  return { rawKey, uuid, hash, counter }
}

async function decryptSecret(rawKey, hash, counter) {
  const encrypted = JSON.parse(hash)
  const parsed = JSON.parse(rawKey)
  const key = await crypto.subtle.importKey("raw", toBuffer(parsed), { name: "AES-CTR", length: 256 }, true, ["encrypt", "decrypt"])
  const buff = await crypto.subtle.decrypt({
    name: "AES-CTR",
    length: 64,
    counter: toBuffer(counter)
  }, key, toBuffer(encrypted))
  return new TextDecoder().decode(buff)
}

function toBuffer(o) {
  return new Uint8Array(Object.entries(o).map(e => e[1]))
}