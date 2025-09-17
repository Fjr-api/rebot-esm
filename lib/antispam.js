/**
* Create By Fjr.
* Contact Me on wa.me/6289692509996
* Follow https://github.com/Fjr-api
*/

const userMessageLimits = {};

export const checkUserMessageLimit = (userId) => {
  const maxMessages = 3; // Maksimum pesan yang diizinkan
  const timeWindow = 5000; // Jendela waktu dalam milidetik (1 menit)

  if (!userMessageLimits[userId]) {
    userMessageLimits[userId] = { count: 1, startTime: Date.now() };
    return false;
}

const userData = userMessageLimits[userId];
const timePassed = Date.now() - userData.startTime;

if (timePassed > timeWindow) {
    // Waktu telah melewati jendela, reset hitungan
    userData.count = 1;
    userData.startTime = Date.now();
    return false;
} else if (userData.count < maxMessages) {
    // Tambahkan hitungan karena masih di bawah batas
    userData.count++;
    return false;
} else {
    // Pengguna telah mencapai batas
    return true;
}
}

