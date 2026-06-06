import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular App');
      constructor(private primeng: PrimeNG) {}

  ngOnInit() {
        this.primeng.ripple.set(true);
    }
}




// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDTeMMH_N2h_0sbKrWo4TTrnffd2kfLht0",
//   authDomain: "crowdfunding-bd6e2.firebaseapp.com",
//   projectId: "crowdfunding-bd6e2",
//   storageBucket: "crowdfunding-bd6e2.firebasestorage.app",
//   messagingSenderId: "520909636110",
//   appId: "1:520909636110:web:f329dfefc88a371b5f725f",
//   measurementId: "G-8770FCHE5V"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);