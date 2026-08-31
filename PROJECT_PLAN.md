# Bookland v2.0 - Knowledge Hub Implementation Plan

## Vision
A unified platform for books, research papers, articles, and ancient scripts - one search to find everything.

---

## Phase 1: Foundation Fixes (1-2 weeks)

### Backend Fixes
- [ ] Fix duplicate files in server/src/lib/
- [ ] Implement user collections routes (/api/collections)
- [ ] Implement reading history routes (/api/history)
- [ ] Add proper rate limiting per endpoint
- [ ] Fix CSP headers (remove unsafe-inline requirement)
- [ ] Add request ID tracing

### Database
- [ ] Create proper indexes for full-text search
- [ ] Migrate reading_history and saved_books models
- [ ] Add vector embeddings for future AI search

### Frontend
- [ ] Fix TypeScript types (remove `any`)
- [ ] Fix mobile 3D performance (reduce particle count)
- [ ] Add proper loading states
- [ ] Fix PWA service worker issues

---

## Phase 2: Research Papers Integration (2-3 weeks)

### API Integrations
- [ ] arXiv API integration
- [ ] PubMed API integration  
- [ ] DOAJ (Directory of Open Access Journals)
- [ ] CrossRef for DOI metadata

### Database
- [ ] Add `papers` table with fields:
  - doi, title, authors, abstract, published_year
  - journal, volume, issue, pages
  - pdf_url, cover_url, access_type (open/restricted)

### Frontend
- [ ] Paper viewer with PDF.js
- [ ] Citation export (BibTeX, APA, MLA)
- [ ] Paper metadata display (journal, volume, etc.)

---

## Phase 3: Ancient Scripts & Multilingual Support (2-3 weeks)

### Unicode Support
- [ ] Add support for Devanagari (Sanskrit), Greek, Arabic, Chinese
- [ ] RTL text rendering for Arabic/Persian
- [ ] Vertical text for classical Chinese

### Sources
- [ ] Digital Library of India
- [ ] Corpus of Contemporary American English (COCA)
- [ ] Perseus Digital Library (Greek & Latin classics)
- [ ] Sahitya Akademi Digital Library (Indian literature)

### Features
- [ ] Transliteration support
- [ ] Multiple script display (original + transliterated)
- [ ] Font loading for Unicode blocks

---

## Phase 4: Collections & Personalization (1-2 weeks)

### User Features
- [ ] Saved books collections
- [ ] Reading history sync across devices
- [ ] Bookmarking specific pages
- [ ] Custom bookshelves/folders

### Social Features
- [ ] Public profile
- [ ] Reading stats dashboard
- [ ] Export library as JSON/BibTeX

---

## Phase 5: Advanced Search (1-2 weeks)

### Search Improvements
- [ ] Full-text search across all content
- [ ] Faceted filtering (by year, author, type)
- [ ] Search suggestions/autocomplete
- [ ] Search result clustering

### AI Features
- [ ] Similar book recommendations
- [ ] Citation network visualization
- [ ] Key terms extraction from PDFs

---

## Phase 6: Mobile & Performance (Ongoing)

### Mobile
- [ ] Responsive 3D fallback (detect GPU)
- [ ] Offline reading (cache books)
- [ ] Native app (React Native / PWA improvements)
- [ ] Progressive web app improvements

### Performance
- [ ] CDN for book covers
- [ ] Gzip compression
- [ ] Lazy loading for 3D components
- [ ] Service worker optimizations

---

## Technical Debt Items

### Code Quality
- [ ] Replace all `any` types
- [ ] Add unit tests (Jest/Vitest)
- [ ] Add integration tests
- [ ] ESLint fix for all warnings

### Infrastructure
- [ ] Production Dockerfiles
- [ ] Nginx reverse proxy
- [ ] Environment-specific configs
- [ ] Monitoring (Prometheus/Grafana)

---

## Success Metrics

1. **Coverage**: 5M+ books, 1M+ papers, 100K+ ancient texts
2. **Performance**: <100ms cached search, <1s uncached
3. **Uptime**: 99.9% availability
4. **User Satisfaction**: 4.5+ star rating, 30% daily return

---

## Estimated Timeline: 2-3 months total

---

**Progress Started**: Beginning Phase 1 immediately