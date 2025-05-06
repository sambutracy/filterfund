import axios from 'axios';

export class PinataService {
  private static JWT = process.env.REACT_APP_PINATA_JWT;
  private static API_URL = 'https://api.pinata.cloud';
  
  static async uploadFile(file: File, name: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: `${name}-${Date.now()}`
    }));
    
    try {
      const response = await axios.post(
        `${this.API_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.JWT}`
          }
        }
      );
      
      const ipfsHash = response.data.IpfsHash;
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }
}