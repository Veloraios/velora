const mobileConfigFiles = [
    'tweaks/virtualjailbreak/Dopamine.mobileconfig',
    'tweaks/virtualjailbreak/Cheyote.mobileconfig',
    // Add more config files manually as needed
  ];
  
  // Function to process each mobileconfig file
  const processMobileConfigFile = (fileUrl) => {
    console.log('Fetching file:', fileUrl); // Log the URL being fetched
    
    fetch(fileUrl)
      .then(response => {
        console.log('Response Status:', response.status); // Check the response status
        if (!response.ok) {
          console.error('Failed to fetch file:', fileUrl, response.statusText);
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(xmlText => {
        console.log('XML loaded successfully'); // Log success message
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        
        // Check if XML was parsed correctly
        const webClipPayloads = xmlDoc.getElementsByTagName('payloadType');
        console.log('Found', webClipPayloads.length, 'WebClip payload(s)');
        
        // Find the first .content-div.virtual-jailbreaks div
        const contentDiv = document.querySelector('.content-div.virtual-jailbreaks');
        if (!contentDiv) {
          console.error('No target div found.');
          return;
        }
  
        for (let i = 0; i < webClipPayloads.length; i++) {
          if (webClipPayloads[i].textContent === 'com.apple.webClip') {
            const webClip = webClipPayloads[i].parentElement; // Get the parent element of the WebClip payload
            console.log('WebClip found:', webClip);
  
            const label = webClip.getElementsByTagName('payloadDisplayName')[0]?.textContent;
            const iconData = webClip.getElementsByTagName('icon')[0]?.textContent;
            
            if (label && iconData) {
              console.log('Label:', label);
              console.log('Icon Data:', iconData.slice(0, 50)); // Log first 50 chars of icon data for debugging
  
              // Create the icon image element
              const img = document.createElement('img');
              img.src = 'data:image/png;base64,' + iconData; // Assuming PNG format
              img.alt = label;
              img.width = 50;
              img.height = 50;
              
              // Create a label paragraph element
              const labelParagraph = document.createElement('p');
              labelParagraph.textContent = label;
  
              // Append the icon and label to the content div
              contentDiv.appendChild(img);
              contentDiv.appendChild(labelParagraph);
  
              // Trigger fade-in effect
              setTimeout(() => {
                contentDiv.style.display = 'block';
                contentDiv.style.opacity = '1';
              }, 100);
            }
          } else {
            console.log('No WebClip found in this payload');
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  // Manually specify the files to process
  mobileConfigFiles.forEach(fileUrl => {
    processMobileConfigFile(fileUrl);
  });
  