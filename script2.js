document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const rocketContainer = document.querySelector(".rocket-container");
  const mainRocketContainer = document.getElementById("mainRocketContainer");
  const boosterContainer = document.getElementById("boosterContainer");
  const mainFlame = document.getElementById("mainFlame");
  const boosterFlame = document.getElementById("boosterFlame");
  const launchSound = document.getElementById("launchSound");
  const successModal = document.getElementById("successModal");
  const nextMissionButton = document.getElementById("nextMissionButton");

  startButton.addEventListener("click", () => {
    startButton.disabled = true;
    startButton.textContent = "Separation...";
    launchSound.play();

    // 1. Initial launch with booster flame active
    boosterFlame.classList.remove("hidden");

    // Use a tiny delay to ensure the CSS transition applies
    setTimeout(() => {
      boosterFlame.classList.add("active");
    }, 10);

    rocketContainer.classList.add("launched"); // Start main ascent

    // 2. Schedule booster separation after 4 seconds
    setTimeout(() => {
      // Trigger the separation animation on the booster's CONTAINER.
      // The flame inside it will now move and fade out with it!
      boosterContainer.classList.add("separating");

      // Make the main rocket visible.
      mainRocketContainer.classList.remove("hidden");
    }, 2000); // Separate after 4 seconds

    // 3. Schedule the main rocket's flame ignition AFTER separation has started
    setTimeout(() => {
      // Activate main rocket's flame
      mainFlame.classList.remove("hidden");
      setTimeout(() => {
        mainFlame.classList.add("active");
      }, 10);
    }, 2400); // Ignites 1.5 seconds after separation begins
    setTimeout(showCompletionPopup, 5000);
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
    window.location.href = "index3.html";
  }

  // Add the click event listener to the button inside the pop-up
  if (nextMissionButton) {
    nextMissionButton.addEventListener("click", goToNextPage);
  }
});
