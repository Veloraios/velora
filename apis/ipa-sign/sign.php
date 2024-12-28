<?php

// Path to the folder for saving signed ipa and plist files
$savePath = __DIR__ . '/uploads/';  // This makes sure the save path is within the 'uploads' folder

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Temporary uploaded file paths
    $certificate = $_FILES['certificate']['tmp_name'];
    $mobileprovision = $_FILES['mobileprovision']['tmp_name'];
    $ipa = $_FILES['ipa']['tmp_name'];
    $pass = $_POST['pass'];

    // Signed .ipa file path
    $signedIpa = $savePath . '/signed_' . $_FILES['ipa']['name'];

    // Execute zsign to sign the IPA file
    exec("zsign -k $certificate -m $mobileprovision -s \"$pass\" -o $signedIpa $ipa");

    // Create the .plist file content
    $plist = <<<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>http://localhost:5500/{$savePath}/signed_{$_FILES['ipa']['name']}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>com.example.app</string>
                <key>bundle-version</key>
                <string>1.0</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>App</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>
PLIST;

    // Path to save the .plist file
    $plistPath = $savePath . '/app.plist';
    file_put_contents($plistPath, $plist);

    // Send the installation link via plist
    $installLink = "itms-services://?action=download-manifest&url=http://localhost:5500/{$savePath}/app.plist"; // Using localhost with port 5500
    echo "The signed .ipa is available at: <a href=\"$installLink\">installation link</a><br>";

    // Save the installation link on the server
    $ipaLink = $savePath . '/link.txt';
    file_put_contents($ipaLink, $installLink);
    echo "The installation link has been saved on the server.";
}

?>
