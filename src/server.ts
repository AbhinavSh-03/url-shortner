import { UrlService } from './modules/urls/url.service';

async function testService() {
  const service = new UrlService();

  const result = await service.createShortUrl({
    longUrl: 'https://example.com',
  });

  console.log('Created:', result);

  const resolved = await service.resolveShortCode(result.shortCode);
  console.log('Resolved:', resolved);
}

testService();


console.log('server starting ...');