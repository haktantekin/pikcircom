# wp-theme: Hassas içerik (pikcircom istemci beklentisi)

pikcircom, hassas gönderileri **postId** bazlı kayıt eder (`localStorage`: `pikcir:sensitive-post-ids`).
Liste endpoint'lerinde `tags` veya `isSensitive` gelmezse gate yalnızca daha önce kaydedilmiş postId'lerde çalışır.

## Önerilen API alanları

Her post nesnesinde (home-feed, explore, profile `posts[]`, koleksiyon `posts[]`):

```json
{
  "id": "123",
  "tags": [{ "slug": "yetiskin", "name": "Yetişkin" }],
  "isSensitive": true
}
```

- `isSensitive: true` — etiket listesi kısaltılmış olsa bile istemci gate uygular.
- `tags` içinde slug veya ad `yetiskin` (Türkçe normalizasyon istemcide yapılır).

## Endpoint'ler

- `GET /wp-json/pikcir/v1/home-feed`
- `GET /wp-json/pikcir/v1/explore` (veya eşdeğeri)
- `GET /wp-json/pikcir/v1/profile/{user}` — `posts`, `favoritePosts`, `collections[].posts`

Kalıcı çözüm: tüm listelerde tutarlı `tags` veya `isSensitive` döndürmek.
