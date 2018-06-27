const jwtToken ={
  secret: 'mysecretpasswordissecret'
}
const moongoseDB = {
  url : "mongodb://localhost:27017/notes"
};

module.exports = {
  jwtToken,
  moongoseDB
};