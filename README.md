# Şarj İstasyonu

Türkiye'deki şarj istasyonlarını gösteren PWA uygulaması.

<a href="https://sarjistasyonu.netlify.app/#/" target="_blank">
  <img src="https://img.shields.io/badge/Live-Demo-brightgreen" alt="Live Demo">
</a>

## Project Requirements

Before running the project, make sure your system meets these requirements:

- **Node.js** v18 or higher  
- **npm** or **yarn**  
- **Quasar CLI** installed globally:
```bash
npm install -g @quasar/cli
```

## Environment Variables

Before running the project, you need to create a .env file in the root directory.
You can find an example of this file in .env.example.

In the .env file, you should enter the free API key obtained from [OpenChargeMap](https://openchargemap.org/site):

```env
VITE_API_KEY=your_openchargemap_api_key
```

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Build the app for pwa production
```bash
quasar -m build pwa
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
