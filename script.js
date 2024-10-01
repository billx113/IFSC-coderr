let branches = [];
let solData = [];

// Fetch the JSON data for branches (first JSON file)
fetch('https://raw.githubusercontent.com/billx113/ifsc_finder2/main/code-list.json') // Ensure this URL is correct
  .then(response => response.json())
  .then(data => {
    // Assuming data.Worksheet contains the branch data
    branches = data.Worksheet.map(item => {
      const values = item["Branch Name\tIFSC\tMICR\tAddress\tCity & State"].split("\t");
      return {
        "Branch Name": values[0].trim(),  // Trim spaces for consistency
        "IFSC": values[1].trim()
      };
    });
    console.log('Branches Data:', branches);  // Debugging
  })
  .catch(error => console.error('Error fetching branch JSON:', error));

// Function to search by Branch Name
function searchByBranch() {
  const input = document.getElementById('branchInput').value.trim().toUpperCase(); // Get user input
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  // Filter branches where the IFSC starts with 'JAKA0' and matches the branch name
  const filteredBranches = branches.filter(branch => 
    branch['Branch Name'].toUpperCase().includes(input) && branch.IFSC.startsWith('JAKA0')
  );

  if (filteredBranches.length > 0) {
    filteredBranches.forEach(branch => {
      const result = document.createElement('p');
      result.textContent = `Branch: ${branch['Branch Name']}, IFSC: ${branch['IFSC']}`;
      resultsDiv.appendChild(result);
    });
  } else {
    resultsDiv.textContent = 'No matching IFSC code found.';
  }
}

// Fetch and extract SOL and Branch Names from the SOL file
fetch('https://raw.githubusercontent.com/billx113/IFsc_finder/main/export%20(1).json') // Ensure this URL is correct
  .then(response => response.json())
  .then(data => {
    // Extracting SOL and branch names from the SOL file
    solData = data.page_data[0].words.reduce((acc, word, idx, arr) => {
      if (/^\d{4}$/.test(word.text)) {  // Check if it's a 4-digit SOL number
        let sol = word.text;
        let branchName = '';

        // Collect the branch name (next words until the next SOL is found)
        let j = idx + 1;
        while (j < arr.length && !/^\d{4}$/.test(arr[j].text)) {
          branchName += arr[j].text + ' ';
          j++;
        }

        acc.push({ "SOL": sol, "Branch Name": branchName.trim() }); // Add SOL and branch name
      }
      return acc;
    }, []);
    console.log('SOL Data:', solData); // Debugging
  })
  .catch(error => console.error('Error fetching SOL JSON:', error));

// Function to search by SOL number
function searchBySOL() {
  const solInput = document.getElementById('solInput').value.trim(); // Get user input
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  // Find the branch name based on SOL number
  const matchedSOL = solData.find(item => item.SOL === solInput);

  if (matchedSOL) {
    const branchName = matchedSOL["Branch Name"].toUpperCase(); // Get the branch name

    // Find the corresponding IFSC from the branches JSON using the branch name
    const matchedBranch = branches.find(branch => 
      branch['Branch Name'].toUpperCase() === branchName && branch.IFSC.startsWith('JAKA0')
    );

    if (matchedBranch) {
      const result = document.createElement('p');
      result.textContent = `Branch: ${matchedBranch['Branch Name']}, IFSC: ${matchedBranch['IFSC']}`;
      resultsDiv.appendChild(result);
    } else {
      // If no matching IFSC found, but we can still show the branch name
      const result = document.createElement('p');
      result.textContent = `Branch: ${branchName}, but no IFSC code found starting with 'JAKA0'.`;
      resultsDiv.appendChild(result);
    }
  } else {
    resultsDiv.textContent = 'No matching SOL number found.';
  }
}