function displyuser(currentUser) {

  if(currentUser != undefined){
      //console.log(Object.values(currentUser))

      let userObj = Object.values(currentUser)[2].username

      console.log(userObj)
  }

}

module.exports.displyuser = displyuser

