export interface GoogleResponse extends Window {

    handleCredentialResponse: any;

    // public handleCredentialResponse(response: any) {
    //     // Decoding  JWT token...
    //       let decodedToken: any | null = null;
    //       try {
    //         decodedToken = JSON.parse(atob(response?.credential.split('.')[1]));
    //       } catch (e) {
    //         console.error('Error while trying to decode token', e);
    //       }
    //       console.log('decodedToken', decodedToken);
    // }

}