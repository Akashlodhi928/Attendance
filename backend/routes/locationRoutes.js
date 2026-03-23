import express from "express";
import {
  updateLocation,
  getLatestLocation
} from "../controllers/locationController.js";

const locationRoute = express.Router();

locationRoute.post("/update", updateLocation);
locationRoute.get("/:userId", getLatestLocation);

export default locationRoute;