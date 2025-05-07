import axios from 'axios';
import { config } from '../config/env';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

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
  
  static async pinFileToIPFS(file: File): Promise<PinataResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: `${file.name}-${Date.now()}`,
      keyvalues: {
        createdAt: new Date().toISOString()
      }
    });
    
    formData.append('pinataMetadata', metadata);
    
    try {
      // First try JWT-based authentication
      if (this.JWT) {
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
        
        return response.data as PinataResponse;
      }
      
      // Fallback to API key authentication
      if (config.PINATA_API_KEY && config.PINATA_API_SECRET) {
        const response = await axios.post(
          `${this.API_URL}/pinning/pinFileToIPFS`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'pinata_api_key': config.PINATA_API_KEY,
              'pinata_secret_api_key': config.PINATA_API_SECRET
            }
          }
        );
        
        return response.data as PinataResponse;
      }
      
      throw new Error('No valid Pinata authentication method available');
    } catch (error) {
      console.error('Pinata pinFileToIPFS error:', error);
      throw error;
    }
  }
}