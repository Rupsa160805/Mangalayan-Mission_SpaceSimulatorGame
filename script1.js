document.addEventListener("DOMContentLoaded", () => {
  // Get all elements
  const launchButton = document.getElementById("launchButton");
  const rocketWrapper = document.querySelector(".rocket-wrapper");
  const groundBackground = document.querySelector(".ground");
  const skyBackground = document.querySelector(".sky");
  const flame = document.getElementById("flame");
  const launchpad = document.getElementById("launchpad");
  const successModal = document.getElementById("successModal");
  const nextMissionButton = document.getElementById("nextMissionButton");

  // NEW elements to control
  const launchSound = document.getElementById("launchSound");
  const smokeElements = document.querySelectorAll(".smoke");
  const scene = document.querySelector(".scene");

  launchButton.addEventListener("click", () => {
    // Disable the button
    launchButton.disabled = true;
    launchButton.textContent = "Launching...";

    // 1. Play the launch sound
    launchSound.play();

    // 2. Activate flame and smoke
    flame.classList.remove("hidden");
    flame.classList.add("active");
    smokeElements.forEach((smoke) => {
      smoke.classList.add("active");
    });

    // 3. Launch rocket and move camera after a slight delay for effects to start
    setTimeout(() => {
      rocketWrapper.classList.add("launched");
      scene.classList.add("launched"); // Trigger camera pan
    }, 500); // 0.5 second delay

    // 4. Swap backgrounds
    setTimeout(() => {
      groundBackground.classList.add("hidden");
      launchpad.classList.add("hidden");
      skyBackground.classList.remove("hidden");
      skyBackground.classList.add("active");
    }, 1500); // Increased delay to 1.5 seconds
    setTimeout(() => {
      isLaunching = false; // Stop the rocket animation
      successModal.classList.remove("hidden"); // Show the pop-up
    }, 4000);

    // ... (Optional reset code remains the same) ...
  });
  // NEW: Add a click listener for the "Next Mission" button
  nextMissionButton.addEventListener("click", () => {
    // This line redirects the browser to your next HTML file
    window.location.href = "index2.html"; // <-- IMPORTANT: Change this to your next file's name!
  });
});
