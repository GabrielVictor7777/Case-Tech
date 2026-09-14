import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA = path.join(__dirname, "data", "products.json");
const IMG_DIR = path.join(__dirname, "public", "images");

fs.mkdirSync(IMG_DIR, {recursive:true});

app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));

function readProducts(){
  return JSON.parse(fs.readFileSync(DATA, "utf8"));
}
function writeProducts(products){
  fs.writeFileSync(DATA, JSON.stringify(products, null, 2), "utf8");
}
function password(){
  return process.env.ADMIN_PASSWORD || "troque-esta-senha";
}
function validToken(req){
  const token = req.headers.authorization?.replace("Bearer ","") || req.cookies?.casetech_admin;
  if(!token) return false;
  const expected = crypto.createHash("sha256").update(password()).digest("hex");
  return token === expected;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: IMG_DIR,
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`);
    }
  }),
  limits:{fileSize:8*1024*1024},
  fileFilter:(_,file,cb)=>{
    const ok = ["image/jpeg","image/png","image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Use JPG, PNG ou WEBP."), ok);
  }
});

app.get("/api/config", (_,res)=>{
  res.json({whatsapp: process.env.WHATSAPP_NUMBER || "5531900000000", instagram:"https://instagram.com/casetechbh"});
});

app.get("/api/products", (_,res)=>res.json(readProducts().filter(p=>p.active)));

app.post("/api/admin/login",(req,res)=>{
  const supplied = String(req.body.password || "");
  if(supplied !== password()) return res.status(401).json({error:"Senha inválida."});
  const token = crypto.createHash("sha256").update(password()).digest("hex");
  res.json({token});
});

function admin(req,res,next){
  if(!validToken(req)) return res.status(401).json({error:"Não autorizado."});
  next();
}

app.get("/api/admin/products",admin,(_,res)=>res.json(readProducts()));

app.post("/api/admin/products",admin,(req,res)=>{
  const products = readProducts();
  const p = {
    id: String(req.body.id || crypto.randomUUID()),
    name: String(req.body.name || ""),
    storage: String(req.body.storage || ""),
    condition: String(req.body.condition || "Lacrado"),
    color: String(req.body.color || ""),
    price: Number(req.body.price || 0),
    image: String(req.body.image || ""),
    active: req.body.active !== false
  };
  if(!p.name) return res.status(400).json({error:"Nome obrigatório."});
  products.push(p); writeProducts(products); res.json(p);
});

app.put("/api/admin/products/:id",admin,(req,res)=>{
  const products = readProducts();
  const i = products.findIndex(p=>p.id===req.params.id);
  if(i<0) return res.status(404).json({error:"Produto não encontrado."});
  products[i] = {...products[i], ...req.body, price:Number(req.body.price ?? products[i].price)};
  writeProducts(products); res.json(products[i]);
});

app.delete("/api/admin/products/:id",admin,(req,res)=>{
  const products = readProducts();
  const p = products.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({error:"Produto não encontrado."});
  if(p.image?.startsWith("/images/")){
    const file = path.join(IMG_DIR,path.basename(p.image));
    if(fs.existsSync(file) && !file.endsWith("iphone-13-pro-max-128gb.png")) fs.unlinkSync(file);
  }
  writeProducts(products.filter(x=>x.id!==req.params.id));
  res.json({ok:true});
});

app.post("/api/admin/products/:id/image",admin,upload.single("image"),(req,res)=>{
  if(!req.file) return res.status(400).json({error:"Imagem não recebida."});
  const products = readProducts();
  const i = products.findIndex(p=>p.id===req.params.id);
  if(i<0) return res.status(404).json({error:"Produto não encontrado."});
  products[i].image = "/images/" + req.file.filename;
  writeProducts(products);
  res.json(products[i]);
});

app.get("/admin",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","admin","index.html"));
});

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(400).json({error:err.message || "Erro inesperado."});
});

app.listen(PORT,()=>console.log(`Case Tech rodando em http://localhost:${PORT}`));
