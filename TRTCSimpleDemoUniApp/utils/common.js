function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
function randomString() {
  return Math.random().toString(36)
    .slice(-6)
}
const getUserAvatarImage = index => `/static/images/avatar${index}_100.png`

const getStaticImage = fileName => `/static/images/${fileName}.png`


export {
  randomNumber,
  randomString,
  getUserAvatarImage,
  getStaticImage,
}
