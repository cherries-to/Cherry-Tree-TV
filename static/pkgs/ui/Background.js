import Html from "/libs/html.js";

let space,
  running = true,
  canvas,
  ctx;

function delay(ms = 100) {
  return new Promise((resolve, reject) => {
    setTimeout((_) => {
      resolve();
    }, ms);
  });
}

// Create an array to store the stars
let stars = [];

// Function to initialize the stars
function createStars() {
  for (let i = 0; i < window.star_count; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.5;

    stars.push({ x, y, radius });
  }
}

// Function to draw the stars on the canvas
function drawStars() {
  ctx.fillStyle = "white";
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Function to update the star positions
window.star_speed = 0.125;
function updateStars() {
  for (let star of stars) {
    // star.x -= 0.125; // Adjust the horizontal scroll speed
    // star.y += 0.125; // Adjust the vertical scroll speed
    star.x -= window.star_speed; // Adjust the horizontal scroll speed
    star.y += window.star_speed; // Adjust the vertical scroll speed

    if (star.y > canvas.height) {
      star.y = -star.radius;
    }
    if (star.x < -star.radius) {
      star.x = canvas.width;
    }
  }
}

// Function to clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to animate the stars
function animate() {
  if (running === false) return;
  clearCanvas();
  updateStars();
  drawStars();
  requestAnimationFrame(animate);
}

const pkg = {
  name: "Space_background",
  type: "svc",
  svcName: "Background",
  privs: 0,
  start: async function (Root) {
    space = new Html("canvas")
      .class("space")
      .style({
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        "z-index": "-1",
      })
      .appendTo("body");

    window.star_speed = window.innerWidth / 20500;
    window.star_count = window.innerWidth / 3.75;

    // Get a reference to the canvas element
    canvas = space.elm;
    ctx = canvas.getContext("2d");

    // Set the canvas dimensions to match the viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.onresize = (_) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      window.star_speed = window.innerWidth / 20500;
      window.star_count = window.innerWidth / 3.75;

      stars = [];
      createStars();
    };

    // Start the animation
    createStars();

    let result = await window.localforage.getItem("settings__backgroundType");
    if (result === "stars") {
      space.style({ opacity: "0.5" });
      animate();
    } else space.style({ opacity: "0" });
  },
  data: {
    async toggle(type) {
      if (type === "none") {
        // Hide
        space.style({ opacity: "0" });
        await delay(1000);
        running = false;
      } else if (type === "stars") {
        space.style({ opacity: "0.5" });
        running = true;
        animate();
        await delay(1000);
      }
    },
  },
  end: async function () {
    console.log("Bye!");
  },
};

export default pkg;
