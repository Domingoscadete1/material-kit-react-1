export default class Config {
    static API_URL = 'https://dce9-154-71-159-172.ngrok-free.app/';
    static APP_NAME = 'MeuApp';
    static API_URL_WS = 'fad7-154-71-159-172.ngrok-free.app';
    static API_MEDIA_URL = 'https://dce9-154-71-159-172.ngrok-free.app';
  
    static getApiUrlMedia() {
      return this.API_MEDIA_URL;
    }
  
    static getApiUrl() {
      return this.API_URL;
    }
    
    static getApiUrlWs() {
      return this.API_URL_WS;
    }
  }
  