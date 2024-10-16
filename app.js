const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Connect to MongoDB
const uri = "mongodb+srv://jadhavbindu2003:binduandsoham@booking-app.fos4d.mongodb.net/booking-app?retryWrites=true&w=majority&appName=booking-app";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Set view engine
app.set("views", path.join(__dirname, "views"));

// Model definitions
const Center = require("./models/Center");
const Sport = require("./models/Sport");
const Booking = require("./models/Booking");
const Court = require("./models/Court");

// Home Route - List of Centers
app.get("/", async (req, res) => {
  try {
    const centers = await Center.find();
    res.render("index", { centers });
  } catch (err) {
    console.error("Error fetching centers:", err);
    res.status(500).send("Server error");
  }
});

// Route to display center information
app.get("/center/:centerID", async (req, res) => {
  try {
    const { centerID } = req.params;
    const center = await Center.findById(centerID).populate('sports');
    if (!center) {
      return res.status(404).send("Center not found");
    }
    res.render("center", { center });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to display sports for a center
app.get("/center/:centerID/sport", async (req, res) => {
  try {
    const { centerID } = req.params;
    const center = await Center.findById(centerID);
    const sports = await Sport.find();
    res.render("selectSport", { center, sports });  // Render a view to select sport
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle sport selection and redirect to schedule
app.post("/center/:centerID/sport", (req, res) => {
  const { sportID } = req.body;
  const { centerID } = req.params;
  let {bookingDate} = req.body;
  const today = new Date().toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

  if(!bookingDate) {
    bookingDate = today;
  }
  if (!sportID) {
    return res.status(400).send("Sport ID is required");
  }

  res.redirect(`/center/${centerID}/sport/${sportID}/${bookingDate}`); // Redirect to the schedule page for that sport
});

// Route to display schedule for a specific sport
app.get("/center/:centerID/sport/:sportID/:date", async (req, res) => {
  const { centerID, sportID, date } = req.params;

  try {
    const center = await Center.findById(centerID);
    const sport = await Sport.findById(sportID);
    const allCourts = await Court.find();
    const courts = allCourts.filter(court => 
      court.center.toString() === centerID && court.sport.toString() === sportID
    );
    
    // Log courts to verify the filtered result
    const courtIds = courts.map(court => court._id);

    // Fetch all bookings (you can adjust the filtering criteria if needed)
    const allBookings = await Booking.find();
    // Filter bookings for the specified date and court IDs
    const bookings = allBookings.filter(booking => {
      // Check if the booking court ID is in the list of court IDs
      let isCourtMatched = false;
      courtIds.forEach(id => {
        if(id.toString() === booking.court.toString()) {
          isCourtMatched = true;
        }
      });
      
      const bookingDate = booking.date.toISOString().split('T')[0]; // Get only the date part
      
      const isDateMatched = bookingDate === date;
      // Return true if both conditions are satisfied
      return isCourtMatched && isDateMatched;
    });

    if (!courts || courts.length === 0) {
      return res.status(404).send("No courts found for this center and sport.");
    }


    // Render the court schedule page with the data
    res.render("schedule", { center, sport, courts, bookings, date });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/select-center", (req, res) => {
  const { centerID } = req.body;
  if (!centerID) {
    return res.status(400).send("CenterID not found");
  }
    res.redirect(`/center/${centerID}`); // Redirect to the center information page
});

// Route to display booking form
app.get('/book', async(req, res) => {
  const { courtID, timeSlot, date } = req.query;
  const court = await Court.findById(courtID);
  const centerID = court.center;
  const sportID = court.sport;
  res.render('bookingForm', { courtID, timeSlot, date, centerID, sportID }); // Render the booking form view
});

// Route to handle booking submission
app.post('/submit-booking', async (req, res) => {
  const { customerName, courtID, timeSlot, date, centerID, sportID } = req.body;

  try {
    // Create a new booking
    const booking = new Booking({
      customerName,
      timeSlot,
      date: new Date(date),
      court: courtID
    });
    await booking.save();
  
    const court = await Court.findById(courtID);
    const centerID = court.center;
    const sportID = court.sport;
    // Redirect to the booking schedule with the centerID and sportID
    res.redirect(`/center/${centerID}/sport/${sportID}/${date}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
