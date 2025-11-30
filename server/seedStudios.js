const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Studio = require('./models/Studio');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const rawData = [
    {
        city: "Noida",
        area: "Pegasus",
        numStudios: 71,
        pocName: "Isha Tyagi",
        pocContact: "9289887783",
        address: "J93Q CVP PEGASUS TOWER, Block A, Sector 68, Noida, Uttar Pradesh 201307 (Noida Infinity Tower)",
        driveLinkInside: "https://drive.google.com/drive/folders/18oFp9ur7PuSlrX6gYz8ie58NiWapx9Mz",
        driveLinkOutside: "https://drive.google.com/drive/folders/1uRkBIyOOenjkEOJ5gZ9skktXW9ig28pZ",
        googleMapLink: "https://www.google.com/maps/dir//Block+A,+Sector+68,+Noida,+Uttar+Pradesh+201307/@28.6087241,77.3869788,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x390cef53be42998d:0xd3e2293f052f5507!2m2!1d77.3897862!2d28.6044698?entry=ttu&g_ep=EgoyMDI1MDYyNi4wIKXMDSoASAFQAw%3D%3D"
    },
    {
        city: "Delhi",
        area: "Paschim Vihar",
        numStudios: 14,
        pocName: "Jayash Sagar",
        pocContact: "8587071657",
        address: "A-16, 2nd Floor, Shubham Enclave, above SBI Bank, Paschim Vihar, New Delhi-110063",
        driveLinkInside: "https://drive.google.com/drive/folders/1K1TdOOgA_K5fuOHy6z0RdNc2EtjtCauQ?usp=sharing",
        driveLinkOutside: "https://drive.google.com/drive/folders/1763lxsbtagk6VPtPNJ4VB9uEw8l9666A?usp=drive_link",
        googleMapLink: "https://www.google.com/maps?q=28.66893768310547,77.09291076660156&z=17&hl=en"
    },
    {
        city: "Kota",
        area: "Kota",
        numStudios: 14,
        pocName: "Ritesh Sharma",
        pocContact: "8824563982",
        address: "Physics Wallah Pvt. Ltd. 90,Gopal square , 4th Floor, Sector - A, Shrinath Puram, Kota, Rajasthan 324010",
        driveLinkInside: "https://drive.google.com/drive/folders/1SnLURBlsr7OhElLnlCr9AV_KkyVPuY8s?usp=sharing",
        driveLinkOutside: "https://drive.google.com/drive/folders/1djuvVu-8UzzVV1rM1Bz96e1UKqE_WsVC?usp=sharing",
        googleMapLink: "https://maps.app.goo.gl/iNcJ5i6ssr7U4W298?g_st=aw"
    },
    {
        city: "Kota",
        area: "Kota_VP",
        numStudios: 10,
        pocName: "Ritesh Sharma",
        pocContact: "8824563982",
        address: "CG Tower-2 A-51(A), Road 3, Behind City Mall, Indraprastha Industrial Area, Kota, Rajasthan - 324005",
        driveLinkInside: "https://drive.google.com/drive/folders/14NIzKKmVyvvExnWuV5QXjnuXOUY8BIT2?usp=sharing",
        driveLinkOutside: "https://drive.google.com/drive/folders/1UTBAdt4WYMoG0KqnGgQQBfQBLQiMi3xB?usp=drive_link",
        googleMapLink: "https://maps.app.goo.gl/vfWYqMSyhHdD3Q7A6?g_st=aw"
    },
    {
        city: "Indore",
        area: "Indore",
        numStudios: 14,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "1st and 2nd Floor, Tulsi building, Brajeshwari Extension, Plot No. E1, Survey No. 591 Part, Village Pipliyana, District Indore, M.P. (452016)",
        driveLinkInside: "https://drive.google.com/drive/folders/161rYCggVVLsMSTOvSj5VNEZ4npp1R2mh",
        driveLinkOutside: "https://drive.google.com/drive/folders/1GDjbSP7RJxiIcHx81qtGmHUJjCkmIV2H",
        googleMapLink: "https://maps.app.goo.gl/7n297R5oHr8jAM6G7"
    },
    {
        city: "Delhi",
        area: "Mukherjee Nagar Old",
        numStudios: 6,
        pocName: "Jayash Sagar",
        pocContact: "8587071657",
        address: "1453 ground floor outram lines opposite bbm dipo delhi-09",
        driveLinkInside: "https://drive.google.com/drive/folders/1dyX7HkHo5TQbs8Z9ulBLuvmU0RmrWTpV?usp=sharing",
        driveLinkOutside: "https://drive.google.com/file/d/1tI2GcY0D5N4zOGZicGNtW1Brg_MCb6HJ/view?usp=sharing",
        googleMapLink: "https://goo.gl/maps/e7ZYcZ759mQqLiJj7"
    },
    {
        city: "Delhi",
        area: "Mukherjee Nagar",
        numStudios: 10,
        pocName: "Jayash Sagar",
        pocContact: "8587071657",
        address: "271, Bhatnagar House, Dhaka, Mukherjee Nagar, Delhi – 110009",
        driveLinkInside: "https://drive.google.com/drive/folders/1nDaQA00ubTprDfcdHhmxEheaxWNR1_s-?usp=sharing",
        driveLinkOutside: "https://drive.google.com/file/d/1kG6ELMcNSXSn4TMlytfMYmHaWzNwupML/view?usp=sharing",
        googleMapLink: "https://maps.app.goo.gl/LmZdkW2yewUrTceM9"
    },
    {
        city: "Noida",
        area: "Noida FTP",
        numStudios: 2,
        pocName: "Manish Khanna",
        pocContact: "7827138953",
        address: "A-61 ,FTP center ,third floor, spring meadows business park , sector - 63 , noida",
        driveLinkInside: "https://drive.google.com/drive/folders/1sniaJSFy0HLCc1Q2G4byyAHLtzfoCCZD?usp=drive_link",
        driveLinkOutside: "https://drive.google.com/drive/folders/1ZoHvT4Dtdy9utcL31mYcoYDDItIg6KJh?usp=drive_link",
        googleMapLink: "https://maps.app.goo.gl/3ATJvz42Y5WNNhdU7"
    },
    {
        city: "Noida",
        area: "Noida Gurukul",
        numStudios: 6,
        pocName: "Rohit Singh",
        pocContact: "93540 66987",
        address: "PW Gurukul C30-6A Phase 2 Industrial Area Noida Sector 62 Pin 201309",
        driveLinkInside: "https://drive.google.com/drive/folders/1YyWja653So8MobLbSZPfyZ-9YBbjqI2U",
        driveLinkOutside: "https://drive.google.com/drive/folders/1ctfk6MVbzl4EkBzwZHSijWweSGHVUKEU",
        googleMapLink: "google.com/maps?q=28.6129947,77.3681486&z=17&hl=en"
    },
    {
        city: "Lucknow",
        area: "Lucknow GN",
        numStudios: 2,
        pocName: "Divesh",
        pocContact: "9125494355",
        address: "Akhilesh gaurav,1/24 viraj khand gomtinagar lucknow 226010",
        driveLinkInside: "https://drive.google.com/drive/folders/1dURixsv6nPylAF92D6FEqJeBGFLI-Hg1",
        driveLinkOutside: "https://drive.google.com/drive/folders/119L5zOFWcZ2YvLCDCh6k0FSAHm_kBBSb",
        googleMapLink: "https://www.google.com/maps/place/26%C2%B051'18.5%22N+81%C2%B001'39.4%22E/@26.8555349,81.0221245,15.75z/data=!4m4!3m3!8m2!3d26.8551446!4d81.0276009?hl=en&entry=ttu&g_ep=EgoyMDI1MTAyOC4wIKXMDSoASAFQAw%3D%3D"
    },
    {
        city: "Ahmedabad",
        area: "Ahemdabad",
        numStudios: 6,
        pocName: "Rahul Varma",
        pocContact: "9624714941",
        address: "240, Satyam Mall Near Kameshwar School Satellite, Ahmedabad 380015",
        driveLinkInside: "https://drive.google.com/drive/folders/1OHmPP96DlEJIDo_T7ecSxAOpaSUyeRs1",
        driveLinkOutside: "https://drive.google.com/drive/folders/1OHmPP96DlEJIDo_T7ecSxAOpaSUyeRs1",
        googleMapLink: "https://maps.app.goo.gl/RY9dAY3X4JYuVzrd7"
    },
    {
        city: "Pune",
        area: "Pune",
        numStudios: 5,
        pocName: "Raushan",
        pocContact: "8294669369",
        address: "Office no 319, Vision Flora, Kunal ICON Road, Pimple Saudagar, Pune Maharashtra - 411027",
        driveLinkInside: "Pune",
        driveLinkOutside: "image.webp",
        googleMapLink: "Vision Flora Mall"
    },
    {
        city: "Bengaluru",
        area: "Bengaluru",
        numStudios: 8,
        pocName: "Maaz",
        pocContact: "8130824663",
        address: "#1073, 24th Main, 1St Sector, HSR Layout,1st ,2nd ,3rd ,4th & 900 sq ft of Terrace Floor Bangalore-560102",
        driveLinkInside: "studio Pic",
        driveLinkOutside: "WhatsApp Image 2025-10-31 at 15.02.00_a9fcacc9.jpg",
        googleMapLink: "Physics Wallah Corporate Office | Bangalore"
    },
    {
        city: "Jaipur",
        area: "Jaipur",
        numStudios: 8,
        pocName: "Bharat Saini",
        pocContact: "9511561989",
        address: "B- 48, Sahakar Marg, Imli Phatak, Lalkothi, Jaipur, Rajasthan 302015",
        driveLinkInside: "https://drive.google.com/drive/folders/1VCWB4aMepfOGL7EZcwfcit0azu_Oizry?usp=sharing",
        driveLinkOutside: "https://drive.google.com/drive/folders/1XRBztqYMXn9O4LszjQ8TowvNCZ2yqhJH?usp=sharing",
        googleMapLink: "https://maps.app.goo.gl/XpRnkhZWvZQdMvMW7"
    },
    {
        city: "Patna",
        area: "Patna LS VP",
        numStudios: 2,
        pocName: "Satyam",
        pocContact: "9006050848",
        address: "Besides Lemon Tree Hotel, LS Complex, Brajkishore Path, South Gandhi Maidan, Raja Ji Salai, Dujra Diara, Patna, Bihar- 800001",
        driveLinkInside: "Patna L.S Complex VP Studio",
        driveLinkOutside: "Building from outside",
        googleMapLink: "LS Complex"
    },
    {
        city: "Patna",
        area: "Patna Iskcon VP",
        numStudios: 2,
        pocName: "Satyam",
        pocContact: "9006050848",
        address: "PW VIDYAPEETH, DUMARIYA TOWER, INFRONT OF ISKCON TEMPLE, BUDDHA MARG, PATNA- 800001",
        driveLinkInside: "Patna Iskcon VP Studio",
        driveLinkOutside: "Building from Outside",
        googleMapLink: "https://maps.app.goo.gl/dsUcVKTf2GvLViKHA?g_st=aw"
    },
    {
        city: "Lucknow",
        area: "Lucknow (Gomtinagar) VP",
        numStudios: 3,
        pocName: "Shahid",
        pocContact: "8887931015",
        address: "Physics Wallah Vidyapeeth Coaching Center Gomti Nagar | IIT JEE, NEET & Foundation Classes, Hotel Nakshatra, Viraj Khand-4, Viraj Khand, Gomti Nagar, Lucknow, Uttar Pradesh",
        driveLinkInside: "Studios",
        driveLinkOutside: "Studio Building Lucknow VP.jpeg",
        googleMapLink: "https://maps.app.goo.gl/RVhJFsBnrte5D5UE8?g_st=iw"
    },
    {
        city: "Kolkata",
        area: "Kolkata VP (Newtown)",
        numStudios: 3,
        pocName: "Ashis Mahato",
        pocContact: "8158900579",
        address: "Panasia House, New Town, Kolkata - 700102",
        driveLinkInside: "STUDIO INSIDE",
        driveLinkOutside: "STUDIO OUTSIDE",
        googleMapLink: "https://maps.app.goo.gl/ZFotpZpyXpzSbrEP7"
    },
    {
        city: "Kanpur",
        area: "Kanpur",
        numStudios: 4,
        pocName: "Ankit Soni",
        pocContact: "7054421961",
        address: "117/N/87 Naveen Nagar, Kakadev Kanpur 208025",
        driveLinkInside: "Drive Link Inside Studios Photos-Kanpur Studio",
        driveLinkOutside: "Drive Link of External Building Photos",
        googleMapLink: "https://www.google.com/maps?q=26.478099,80.2950044&z=17&hl=en"
    },
    {
        city: "Varanasi",
        area: "Varanasi VP",
        numStudios: 4,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "B36/10 P.J.R, 2nd & 3rd Floor,Sheetal COMPLEX, Durgakund, Near Tridev Mandir, Varanasi, Uttar Pradesh -221005",
        driveLinkInside: "https://drive.google.com/drive/folders/1Aqq5vbdUsM2FmkP-MUsrTkTlZs1e4iFX?usp=sharing",
        driveLinkOutside: "https://drive.google.com/drive/folders/15mA5udMPRhK9LUE__D9cJiAPGZptCeFh",
        googleMapLink: "https://maps.app.goo.gl/vmCUtH1gMsbvA9gf8"
    },
    {
        city: "Malda",
        area: "Malda VP",
        numStudios: 1,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "Mahananda Pally, Jhaljhalia, Near - North Point English Academy, West bengal- 732102",
        driveLinkInside: "https://drive.google.com/drive/folders/1bGo9Jtoie4zBMLN3lI_OCVbYrj1NZLer",
        driveLinkOutside: "https://drive.google.com/drive/folders/1SH5jzj6fRDeyoJDNi1HOhf3Wg1Vw6D0W",
        googleMapLink: "https://maps.app.goo.gl/csEYVoBkPxNwT15p6"
    },
    {
        city: "Gorakhpur",
        area: "Gorakhpur VP",
        numStudios: 1,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "3rd Floor Kamlesh Arcade building, Near Golghar kali mandir & M-bazar, Golghar Gorakhpur, 273001",
        driveLinkInside: "https://drive.google.com/drive/folders/13SoKxlWxJUv2Jasb4TdYTNZwOWFk5UXR",
        driveLinkOutside: "",
        googleMapLink: "https://maps.app.goo.gl/6Utq5dLosDEp5zKk7"
    },
    {
        city: "Panchkula",
        area: "Panchkula VP",
        numStudios: 1,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "#263 physics wallha sector 14 panchkula haryana 134109",
        driveLinkInside: "https://drive.google.com/drive/folders/1ElQqI55Djsd1PA-KHduY59CTSIvdhSUz",
        driveLinkOutside: "https://drive.google.com/drive/folders/19Gi7HIBAICUQw9dxV8xkpM2T0Cl3vu7t",
        googleMapLink: "https://maps.app.goo.gl/W1TV4tS3Z24R6uq8A"
    },
    {
        city: "Vadodra",
        area: "Vadodara VP",
        numStudios: 1,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "2nd, 3rd and 4th Floor, Pizza hut, Fortune Besides, Race Course Rd, Vadiwadi, Vadodara, Gujarat 390007",
        driveLinkInside: "https://drive.google.com/drive/folders/1v34mik4qUzdbV9ISD3bDeGKMD0mMYRo-",
        driveLinkOutside: "https://drive.google.com/drive/folders/1Cbs647SKVY5sKq7gcavcwFxynRimU8_0",
        googleMapLink: "https://maps.app.goo.gl/HDNqvZ2iNByeRxMn6"
    },
    {
        city: "Surat",
        area: "Surat VP",
        numStudios: 1,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "4th Floor, Roongta Signature, New City Light Rd, Opposite Shree Baba Shyam Mandir, Anand Park, Althan, Surat, Gujarat -395007",
        driveLinkInside: "https://drive.google.com/drive/folders/1khAy-wM1WvcLwq2cqk96yPuSezq71DM0",
        driveLinkOutside: "https://drive.google.com/drive/folders/1GSYQe5_DOuDuXkd26UWUk1SHOHpvXetw",
        googleMapLink: "https://maps.app.goo.gl/a4jrSCoZ39BKNw588"
    },
    {
        city: "Bhubaneswar",
        area: "Bhubaneswar",
        numStudios: 2,
        pocName: "Shagun Awasthi",
        pocContact: "9399321143",
        address: "Physics Wallah-Vidyapeeth: Plot No. 427& 428 , Khushi Shanti Tower , Station Bazar, Laxmi Sagar , Budheswari Colony, Bhubaneswar , Khorda, Odisha , 751006",
        driveLinkInside: "https://drive.google.com/drive/folders/1BeSH7VuPTLNh-2GcDuh6rKXldh5hAzCK",
        driveLinkOutside: "https://drive.google.com/drive/folders/1WjZyFNPOUahXxc9NN9EXPzmDMGQk_M7q",
        googleMapLink: "https://maps.app.goo.gl/fM9aEAKnYJro7ogc7"
    },
    {
        city: "Kolkata",
        area: "Kolkata - Sealdah",
        numStudios: 1,
        pocName: "Bishnu Das",
        pocContact: "8910739176",
        address: "8th Floor, Smart Bazar Building, Railway/Metro Station, near Sealdah, Vidyapati Setu, Sealdah, Raja Bazar, Kolkata, West Bengal 700014",
        driveLinkInside: "pic",
        driveLinkOutside: "OUTSIDE PIC",
        googleMapLink: "https://maps.app.goo.gl/PgiKbSbvbVpLkrVR9?g_st=ipc"
    },
    {
        city: "Kolkata",
        area: "Kolkata - Sealdah Corporate",
        numStudios: 2,
        pocName: "Bishnu Das",
        pocContact: "8910739176",
        address: "Unit # 702 on 7 th floor, ‘ Siddharth City Centre, 122 Lenin Sarani, Kolkata – 700 013.",
        driveLinkInside: "Inside Studios",
        driveLinkOutside: "Outside Office",
        googleMapLink: "google.com/maps?q=Siddharth+City+Center,+122,+Lebutala,+Bowbazar,+Kolkata,+West+Bengal+700013&ftid=0x3a0276ff094aae55:0xbe4d8775f57cb6e8&entry=gps&lucs=,94284511,94224825,94227247,94227248,94231188,94280564,47071704,47069508,94273883,94218641,94282134,94203019,47084304,94286869&g_ep=CAISEjI1LjM4LjAuODA3MzYwMDM5MBgAIIgnKn4sOTQyODQ1MTEsOTQyMjQ4MjUsOTQyMjcyNDcsOTQyMjcyNDgsOTQyMzExODgsOTQyODA1NjQsNDcwNzE3MDQsNDcwNjk1MDgsOTQyNzM4ODMsOTQyMTg2NDEsOTQyODIxMzQsOTQyMDMwMTksNDcwODQzMDQsOTQyODY4NjlCAklO&skid=62075975-9764-430f-8c2e-726a23fef7ac&g_st=ipc"
    },
    {
        city: "Aurangabad",
        area: "Aurangabad VP",
        numStudios: 1,
        pocName: "Raushan",
        pocContact: "8294669369",
        address: "Plot E36/2 near prozone mall MIDC chikathana Chhatrapati Shambha ji nagar 431007.",
        driveLinkInside: "Sambhajinagar",
        driveLinkOutside: "1f837f77-cb8f-46c0-b155-5fdb3db84204.jpg",
        googleMapLink: "https://maps.app.goo.gl/AC7mb7R21tY8vqHx8?g_st=iw"
    },
    {
        city: "Kota",
        area: "Kota Gurukul",
        numStudios: 12,
        pocName: "Prashant Vaishnav",
        pocContact: "8769065808",
        address: "Plot No.793,794 Subhash Nagar Kota Near Truck union chauraha, Power Fit Gym, In front of chirag customz Kota 324005, Rajasthan",
        driveLinkInside: "Kota Gurukul",
        driveLinkOutside: "25° 7' 13.0606\" N 75° 50' 47.5526\" E",
        googleMapLink: ""
    },
    {
        city: "Srinagar",
        area: "Srinagar",
        numStudios: 4,
        pocName: "Prashant Vaishnav",
        pocContact: "8769065808",
        address: "Rajbagh near Modern Hospital Srinagar, Jammu & Kashmir - 190008.",
        driveLinkInside: "Srinagar",
        driveLinkOutside: "34° 4' 4.2053\" N 74° 49' 58.2517\" E",
        googleMapLink: ""
    },
    {
        city: "Jammu",
        area: "Jammu_VP",
        numStudios: 1,
        pocName: "Prashant Vaishnav",
        pocContact: "8769065808",
        address: "Physicswallah Private Limited Pacific Tower 2nd And 3rd Floor Malik Market, Channi Rama, Jammu J&K 180015",
        driveLinkInside: "Jammu",
        driveLinkOutside: "32° 42' 13.873\" N 74° 53' 43.004\" E",
        googleMapLink: ""
    },
    {
        city: "Prayagraj",
        area: "Prayagraj",
        numStudios: 3,
        pocName: "Prashant Vaishnav",
        pocContact: "8769065808",
        address: "TF-01, Vinayak Triveni Tower, P D Tandon Road, Civil Lines Allahabad 211001",
        driveLinkInside: "Prayagraj",
        driveLinkOutside: "25° 27' 17.4492\" N 81° 49' 42.5212\" E",
        googleMapLink: ""
    },
    {
        city: "Noida",
        area: "JIMS, Noida",
        numStudios: 9,
        pocName: "Isha Tyagi",
        pocContact: "9289887783",
        address: "Plot no 20 C, Tech Zone IV, Amrapali Dream Valley, Greater Noida, Uttar Pradesh 201308",
        driveLinkInside: "https://drive.google.com/drive/folders/1z6soaUfSY5hm9bY4xDxLU8ELeW8OLXdx",
        driveLinkOutside: "https://drive.google.com/drive/folders/1Pr94rrNuvDRLoaC4MEJThnm86zeJITlB",
        googleMapLink: "https://www.google.com/maps/place/28%C2%B035'47.0%22N+77%C2%B026'15.7%22E/@28.5963859,77.4351179,17z/data=!3m1!4b1!4m4!3m3!8m2!3d28.5963859!4d77.4376928?hl=en&entry=ttu&g_ep=EgoyMDI1MDYyNi4wIKXMDSoASAFQAw%3D%3D"
    },
    {
        city: "Delhi",
        area: "Saket_VP",
        numStudios: 1,
        pocName: "Rishu",
        pocContact: "9910544243",
        address: "Physics Wallah Plot No. 3 Khasra No. - 264, Westend Marg, Near Metro Station, Saket Saidulazab, New Delhi, 110030",
        driveLinkInside: "https://drive.google.com/drive/folders/13q1yVimxA1nHxngUDpQUUWwm9u-W7RPv",
        driveLinkOutside: "https://drive.google.com/file/d/1LRN_qeZ_PhJ-X4ADh7OdURkP-fQQLkmL/view?usp=sharing",
        googleMapLink: "28° 31' 4.6376\" N 77° 11' 51.9421\" E"
    },
    {
        city: "Jodhpur",
        area: "Jodhpur VP",
        numStudios: 4,
        pocName: "Prashant Vaishnav",
        pocContact: "8769065808",
        address: "Rukmani Tower 936, 9th D Road, near SAINT ANDREWS HALL, Sardarpura, Jodhpur, Rajasthan 342003 _ 1st & 2nd floor, Jilani Tower, Circle, behind Jasoda Tower, Akhaliya Vikas Yojana, Jodhpur, Rajasthan 342008",
        driveLinkInside: "Jodhpur",
        driveLinkOutside: "26° 16' 25.9464\" N 73° 0' 33.1992\" E",
        googleMapLink: ""
    },
    {
        city: "Noida",
        area: "Noida One",
        numStudios: 2,
        pocName: "Christy George",
        pocContact: "9650569587",
        address: "Physics Wallah Head Office | Noida, Noida One, 8th floor, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309",
        driveLinkInside: "",
        driveLinkOutside: "",
        googleMapLink: "https://maps.app.goo.gl/z5XLaUHQSbQBoY9d7"
    }
];

function extractCoordinates(link) {
    if (!link) return null;

    // Regex for standard decimal coordinates (e.g., @28.6087241,77.3869788)
    const decimalRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const decimalMatch = link.match(decimalRegex);
    if (decimalMatch) {
        return { lat: parseFloat(decimalMatch[1]), lng: parseFloat(decimalMatch[2]) };
    }

    // Regex for query param coordinates (e.g., ?q=28.66893768310547,77.09291076660156)
    const queryRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = link.match(queryRegex);
    if (queryMatch) {
        return { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) };
    }

    // Regex for DMS coordinates (e.g., 25° 7' 13.0606" N 75° 50' 47.5526" E)
    // This might be in the link or the link text itself if passed as link
    const dmsRegex = /(\d+)°\s*(\d+)'\s*(\d+(\.\d+)?)"\s*([NS])\s*(\d+)°\s*(\d+)'\s*(\d+(\.\d+)?)"\s*([EW])/;
    const dmsMatch = link.match(dmsRegex);
    if (dmsMatch) {
        const lat = (parseFloat(dmsMatch[1]) + parseFloat(dmsMatch[2]) / 60 + parseFloat(dmsMatch[3]) / 3600) * (dmsMatch[5] === 'S' ? -1 : 1);
        const lng = (parseFloat(dmsMatch[6]) + parseFloat(dmsMatch[7]) / 60 + parseFloat(dmsMatch[8]) / 3600) * (dmsMatch[10] === 'W' ? -1 : 1);
        return { lat, lng };
    }

    return null;
}

const seedStudios = async () => {
    try {
        await Studio.deleteMany();
        console.log('Studios cleared');

        const studiosToInsert = rawData.map(data => {
            let coords = extractCoordinates(data.googleMapLink);

            // Fallback: Check driveLinkOutside for coordinates if googleMapLink is empty or failed (some data has coords in driveLinkOutside column)
            if (!coords) {
                coords = extractCoordinates(data.driveLinkOutside);
            }

            // Default coordinates if extraction fails (New Delhi)
            const lat = coords ? coords.lat : 28.6139;
            const lng = coords ? coords.lng : 77.2090;

            return {
                name: `${data.area} Studio`,
                location: data.area,
                city: data.city,
                area: data.area,
                address: data.address,
                capacity: 10, // Default capacity
                numStudios: data.numStudios,
                pocName: data.pocName,
                pocContact: data.pocContact,
                driveLinkInside: data.driveLinkInside,
                driveLinkOutside: data.driveLinkOutside,
                googleMapLink: data.googleMapLink,
                lat: lat,
                lng: lng,
                coordinates: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                facilities: ["Wi-Fi", "AC", "Soundproofing"], // Default facilities
                images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000"] // Placeholder
            };
        });

        await Studio.insertMany(studiosToInsert);
        console.log('Studios imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedStudios();
