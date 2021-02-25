# Object-Detector-App
Application to find objects in photos


AKILLI TELEFONLAR İLE NESNE TESPİTİ
Proje Çalışma Aşamaları:

Telefonunuzu kullanacaksanız telefonu bilgisayara usb girişinden bağlayın
NOT: Debugger modunun ve file transferin açık olduğuna emin olun

Emulatör kullanacaksanız emulatörü açın

Komut istemini yönetici olarak çalıştırın
Projenin olduğu klasöre gelin ve react-native start yazın

İkinci komut istemini açın
Projenin olduğu klasöre gelin ve react-native run-android yazın

Uygulama arayüzü telefonunuzda gözüktüğünde kullanmaya başlayabilirsiniz.

Kendiniz bir fotoğraf seçmek için 'KAMERA' , galeriden bir fotoğraf seçmek için 'GALERİ' butonuna tıklayın
Fotoğrafın firestore'a gönderilmesini bekleyin.

Çalıştıra Tıklayın (çalışmazsa en az üç kez tıklayın).

Gönderdiğiniz fotoğrafın nesne tespiti API’ndan gelen sonuç nesnelerin isimlerini, API tahmininin doğruluk payını ve konum bilgilerini içeriyordu. 


ÖNEMLİ NOT: Projeyi geliştirken kullandığımız APİ ve kütüphanelerin sürümleri package.json kısmında bulunan dependencies gibi olmalıdır.
"dependencies": {
    "@react-native-firebase/app": "^10.4.0",
    "@react-native-firebase/storage": "^10.4.0",
    "react": "16.13.1",
    "react-native": "0.63.4",
    "react-native-image-picker": "^3.1.2"
  },
