import jwt from "jsonwebtoken"

export const isAuth = async (req, res , next) => {
 try {
    let token = req.cookies.token

    if(!token){
        return res.status(404).json({message:"Unauthorized, token not found"})
    }

    const decoded = jwt.verify(token , process.env.JWT_SECRET)
    req.user = decoded
    next()
 } catch (error) {
    return res.status(500).json({message:`error in isAuth controller ${error}`})
 }
}



