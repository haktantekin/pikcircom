# Profil gönderileri sayfalama (wp-theme)

Profilde **Pikçirlarım** sekmesinin tüm gönderileri göstermesi için WordPress tarafında sayfalı endpoint gerekir.

## Kurulum

`wp-theme/functions.php` içine ekleyin:

```php
require_once get_template_directory() . '/pikcir-profile-posts.php';
```

Dosya: [`wp-theme/pikcir-profile-posts.php`](../wp-theme/pikcir-profile-posts.php)

## Endpoint

`GET /wp-json/pikcir/v1/profile/{username}/posts?page=1&per_page=12`

Yanıt:

```json
{
  "posts": [],
  "page": 1,
  "per_page": 12,
  "post_count": 42,
  "has_more": true
}
```

Next.js BFF: `/api/profile-posts/{username}` — bu endpoint yoksa profil cevabından dilimlemeye düşer (eski WP sürümleri).
