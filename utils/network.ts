export const getCurrentIP = async (): Promise<string> => {
  try {
    // Try to get IP from a public API
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    // Fallback to local IP detection
    try {
      // This is a fallback method that works in browsers
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      return new Promise((resolve) => {
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)?.[1];
          if (myIP) {
            pc.close();
            resolve(myIP);
          }
        };
        
        // Timeout fallback
        setTimeout(() => {
          pc.close();
          resolve('192.168.1.x');
        }, 3000);
      });
    } catch (fallbackError) {
      return '192.168.1.x';
    }
  }
};
