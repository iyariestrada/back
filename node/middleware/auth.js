import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token inválido o expirado" });
    }
    req.userId = decoded.id;
    next();
  });
};

/*
export const verifyToken = (req, res, next) => {
  // Verificar múltiples lugares donde podría estar el token
  const token = req.headers["authorization"]?.split(" ")[1] || 
                req.headers["x-access-token"] || 
                req.cookies?.token;

  if (!token) {
    return res.status(403).json({ 
      success: false, 
      message: "Token no proporcionado",
      receivedHeaders: req.headers // Para debug
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.user = decoded; // Guarda todo el payload por si acaso
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(401).json({ 
      success: false, 
      message: "Token inválido o expirado",
      error: err.message 
    });
  }
};
*/
