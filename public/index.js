const form = document.getElementById("secretForm")
const secretInput = document.getElementById("secretInput")

form.addEventListener("submit", sendSecret)

async function sendSecret(evt) {
  evt.preventDefault()
  console.log("sending secret")

  const secret = secretInput.value
  const uuid = crypto.randomUUID()
  const hash = 'hash' + secret


  const res = await fetch("/pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ uuid, hash })
  })

  console.log(res)

  const text = await res.text()

  console.log(text)

  return false
}
