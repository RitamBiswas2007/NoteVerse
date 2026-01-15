export async function encryptContent(content: string, password: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("noteverse-salt"), // In prod, this should be unique per file
            iterations: 100000,
            hash: "SHA-256"
        },
        key,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        derivedKey,
        enc.encode(content)
    );

    // Combine IV and Encrypted content for storage
    const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(encrypted), iv.byteLength);

    return btoa(String.fromCharCode(...buffer));
}

export async function decryptContent(encryptedBase64: string, password: string): Promise<string> {
    try {
        const enc = new TextEncoder();
        const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        const iv = encryptedData.slice(0, 12);
        const data = encryptedData.slice(12);

        const key = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("noteverse-salt"),
                iterations: 100000,
                hash: "SHA-256"
            },
            key,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            derivedKey,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        throw new Error("Invalid Password");
    }
}
