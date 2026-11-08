const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.PLANT_ID_API_KEY || 'icJ3wwEd0qFoN2KbWTwHubpkFLnVR66hNbrwvBtJIuaH1acQUj';

// Resim parametresi kontrolü
const inputArg = process.argv[2];
let targetImage = inputArg || 'agac.jpg';
let resolvedImagePath = path.resolve(process.cwd(), targetImage);

if (!fs.existsSync(resolvedImagePath)) {
  console.error('\n❌ Hata: Analiz edilecek resim bulunamadı!');
  if (!inputArg) {
    console.error('Bulunulan dizinde varsayılan "agac.jpg" dosyası tespit edilemedi.');
  } else {
    console.error(`Belirtilen yol geçersiz: "${inputArg}"`);
  }
  console.error('\nLütfen bir resim yolu belirterek çalıştırın:');
  console.error('  node plant_id/test_plant_id.js <resim_yolu>\n');
  console.error('Örnek:');
  console.error('  node plant_id/test_plant_id.js resim.jpg');
  console.error('  node plant_id/test_plant_id.js C:\\resimler\\yaprak.jpg\n');
  process.exit(1);
}

async function identifyPlantAndHealth(resolvedPath) {
  console.log(`Resim okunuyor: ${resolvedPath}`);
  const imageBase64 = fs.readFileSync(resolvedPath).toString('base64');

  // Plant.id v3 Identification + Health endpoint
  const url = new URL('https://plant.id/api/v3/identification');
  url.searchParams.set(
    'details',
    'common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,treatment,cause'
  );
  url.searchParams.set('language', 'tr,en');

  const requestBody = {
    images: [imageBase64],
    health: 'all',
    similar_images: true
  };

  console.log('Sending request to Plant.id (Kindwise) API...');
  const startTime = Date.now();

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Api-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const durationMs = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`Response received in ${durationMs}ms.\n`);

  // Parse and display results
  displayResults(data);

  // Save raw response in the current working directory
  const outputPath = path.resolve(process.cwd(), 'plant_id_result.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n📄 Detaylı JSON çıktısı kaydedildi: ${outputPath}`);
}

function displayResults(data) {
  const result = data.result;

  console.log('====================================================');
  console.log('              PLANT.ID ANALİZ RAPORU                ');
  console.log('====================================================\n');

  // 1. Bitki mi?
  if (result.is_plant) {
    const isPlantProb = (result.is_plant.probability * 100).toFixed(1);
    console.log(`🔍 Bitki Tespiti: ${result.is_plant.binary ? 'Evet' : 'Belirsiz/Karma'} (%${isPlantProb})`);
  }

  // 2. Sağlık Değerlendirmesi
  console.log('\n--- 🩺 SAĞLIK DURUMU ---');
  if (result.is_healthy) {
    const isHealthyProb = (result.is_healthy.probability * 100).toFixed(1);
    const healthStatus = result.is_healthy.binary ? 'SAĞLIKLI' : 'HASTA / SORUNLU';
    console.log(`Genel Durum     : ${healthStatus} (%${isHealthyProb} güven)`);
  }

  // Hastalık / Durum detayları
  if (result.disease && result.disease.suggestions?.length > 0) {
    console.log('\nTespit Edilen Durumlar / Bulgular:');
    result.disease.suggestions.forEach((disease, idx) => {
      const prob = (disease.probability * 100).toFixed(1);
      const trName = disease.details?.local_name?.tr || disease.details?.common_names?.tr?.[0] || '';
      const enName = disease.details?.local_name?.en || disease.details?.common_names?.en?.[0] || '';
      const displayName = trName || enName ? `${disease.name} (${[trName, enName].filter(Boolean).join(' / ')})` : disease.name;

      console.log(`  ${idx + 1}. ${displayName} - Olasılık: %${prob}`);

      const desc = disease.details?.description?.tr || disease.details?.description?.en;
      if (desc) {
        console.log(`     Açıklama: ${desc}`);
      }

      const treatment = disease.details?.treatment?.tr || disease.details?.treatment?.en;
      if (treatment) {
        console.log(`     Tedavi / Müdahale: ${JSON.stringify(treatment)}`);
      }
    });
  } else {
    console.log('Herhangi bir hastalık tespit edilmedi.');
  }

  // 3. Bitki Türü Tahminleri
  console.log('\n--- 🌿 BİTKİ / TÜR TAHMİNLERİ ---');
  if (result.classification && result.classification.suggestions?.length > 0) {
    result.classification.suggestions.slice(0, 5).forEach((item, idx) => {
      const prob = (item.probability * 100).toFixed(2);
      const commonTr = item.details?.common_names?.tr?.join(', ');
      const commonEn = item.details?.common_names?.en?.slice(0, 3).join(', ');

      console.log(`  ${idx + 1}. Bilimsel Ad: ${item.name} (%${prob})`);
      if (commonTr) console.log(`     Türkçe Ad  : ${commonTr}`);
      if (commonEn) console.log(`     İngilizce  : ${commonEn}`);
      if (item.details?.taxonomy) {
        const tax = item.details.taxonomy;
        console.log(`     Taksonomi  : ${tax.class || ''} > ${tax.order || ''} > ${tax.family || ''}`);
      }
    });
  } else {
    console.log('Tür tahmini bulunamadı.');
  }

  console.log('\n====================================================');
}

identifyPlantAndHealth(resolvedImagePath).catch(console.error);
