const days = 30; // Configurable time period in days
const token = ""; // Optional: Add your GitHub personal access token here (leave empty for unauthenticated requests)

async function fetchTotalCommits() {
    const org = "UltiBlox";
    const searchCommitsUrl = (date) => `https://api.github.com/search/commits?q=org:${org}+author-date:>=${date}`;

    // Get the start date (e.g., 30 days ago)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // Format: YYYY-MM-DD

    try {
        // Prepare headers (add token if available)
        const headers = {
            Accept: "application/vnd.github.cloak-preview", // Required for the Search API
        };
        if (token) {
            headers.Authorization = `token ${token}`;
        }

        // Fetch data from the GitHub Search API
        const response = await fetch(searchCommitsUrl(startDate), { headers });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`GitHub API returned error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched commit data:", data);

        // Return the total count of commits
        return data.total_count || 0;
    } catch (error) {
        console.error("Error fetching commit data:", error);
        return 0; // Return 0 commits on failure
    }
}

// Update the DOM with the total commits
document.addEventListener("DOMContentLoaded", async () => {
    const target = document.querySelector("#activity-summary"); // Target the paragraph for displaying results

    if (target) {
        target.textContent = "🚀 Total Commits in the Last 30 Days: Loading...";
        try {
            const totalCommits = await fetchTotalCommits();
            target.textContent = `🚀 Total Commits in the Last 30 Days: ${totalCommits}`;
        } catch (error) {
            target.textContent = "Error fetching commit data.";
        }
    } else {
        console.error("Target element not found!");
    }
});
