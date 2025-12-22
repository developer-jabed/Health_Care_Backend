import { Router } from "express";

const router = Router();

// This will confirm file is loaded
console.log("CouponRoutes router loaded ✅");

router.get("/test", (req, res) => {
  console.log("Coupon test route hit ✅");
  res.send("Coupon route works!");
});


export const CouponRoutes = router;
