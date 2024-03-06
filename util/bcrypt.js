const bcrypt = require('bcrypt')

const hashData = async (data, saltRound = 10) => {
   try {
       const hashedData = await bcrypt.hash(data, saltRound);
       return hashedData;
   } catch (err) {
       throw err;
   }
};

const verifyHash = async (unHashed,hashed) => {
    try{
        console.log('reach to hash check');
        const match = await bcrypt.compare(unHashed,hashed)
        return match;
    }catch(err){
        throw(err);
    }
}

module.exports = {hashData,verifyHash} 