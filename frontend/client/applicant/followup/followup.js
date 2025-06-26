document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("followupForm");
  const confirmation = document.getElementById("confirmation");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const name = form.fullName.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) return;

    // Build FormData (for actual upload)
    const data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("message", message);
    // append all selected files
    Array.from(form.attachments.files).forEach((file, i) => {
      data.append(`file_${i}`, file);
    });

    // Simulate upload…
    // await fetch("/api/followup", { method: "POST", body: data });

    form.reset();
    confirmation.classList.add("show");
    setTimeout(() => confirmation.classList.remove("show"), 4000);
  });
});
