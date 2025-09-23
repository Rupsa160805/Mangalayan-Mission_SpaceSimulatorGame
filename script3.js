document.addEventListener("DOMContentLoaded", () => {
  const launchButton = document.getElementById("launchButton");
  const sceneContainer = document.querySelector(".scene-container");
  const rocketWrapper = document.querySelector(".rocket-wrapper");
  const flame = document.getElementById("flame");
  const successModal = document.getElementById("successModal");
  const nextMissionButton = document.getElementById("nextMissionButton");
  launchButton.addEventListener("click", () => {
    // Disable the button to prevent multiple clicks
    launchButton.disabled = true;
    launchButton.style.opacity = "0"; // Hide the button

    // 1. Activate the flame
    flame.classList.remove("hidden");
    setTimeout(() => {
      flame.classList.add("active");
    }, 10);

    // 2. Start the rocket's ascent animation
    rocketWrapper.classList.add("launched");

    // 3. Schedule the background transition to start after the rocket is high enough
    setTimeout(() => {
      sceneContainer.classList.add("in-space");
    }, 2000); // Start fading to space after 2 seconds
    setTimeout(() => {
      isLaunching = false; // Stop the rocket animation
      successModal.classList.remove("hidden"); // Show the pop-up
    }, 4000);
    setTimeout(showCompletionPopup, 9500);
  });
  /**
   * This function shows the pop-up window.
   */
  function showCompletionPopup() {
    if (successModal) {
      successModal.classList.remove("hiddenz");
    }
  }

  /**
   * This function redirects the browser to the next page.
   * IMPORTANT: Change 'index3.html' if your file has a different name!
   */
  function goToNextPage() {
    window.location.href = "index4.html";
  }

  // Add the click event listener to the button inside the pop-up
  if (nextMissionButton) {
    nextMissionButton.addEventListener("click", goToNextPage);
  }
});
