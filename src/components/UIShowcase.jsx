import React, { useState } from 'react';
import { Button, Input, Card, H1, H2, H3, H4, Text, Overline, Label, Code } from './ui/index.js';

// Icons (lucide-react already installed)
import {
  Zap, ArrowRight, Mail, Lock, Search, Eye, EyeOff,
  TrendingUp, BarChart2, Droplets, DollarSign, CheckCircle2, AlertCircle,
} from 'lucide-react';

function Section({ title, children }) {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-surface-200" />
        <Overline>{title}</Overline>
        <div className="h-px flex-1 bg-surface-200" />
      </div>
      {children}
    </section>
  );
}

export default function UIShowcase() {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="gradient-brand px-6 py-16 text-center relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <Overline color="white" className="opacity-80 mb-4 block">GasCalculator</Overline>
        <H1 className="text-white text-4xl md:text-5xl mb-4">UI Kit / Design System</H1>
        <Text variant="body-lg" color="white" className="opacity-80 max-w-xl mx-auto">
          Все компоненты брендбука — в одном месте. Используй токены, соблюдай дизайн-систему.
        </Text>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* ── COLOR PALETTE ── */}
        <Section title="Color System">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: 'Digital Blue', bg: 'bg-primary', text: '#0063CC' },
              { name: 'Savings Green', bg: 'bg-secondary', text: '#00C883' },
              { name: 'Graphite Dark', bg: 'bg-graphite', text: '#1F1F31' },
              { name: 'Error Red', bg: 'bg-danger', text: '#FD2F2F' },
              { name: 'Clean White', bg: 'bg-surface border border-surface-300', text: '#FFFFFF' },
            ].map(({ name, bg, text }) => (
              <div key={name} className="flex flex-col gap-2">
                <div className={`h-20 rounded-xl ${bg} shadow-md`} />
                <Text variant="caption" className="font-medium text-graphite">{name}</Text>
                <Code inline>{text}</Code>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section title="Typography — Inter">
          <div className="space-y-4">
            <H1>H1 — Precision in Every Calc</H1>
            <H2>H2 — Savings & Transparency</H2>
            <H3>H3 — Economic Benefits</H3>
            <H4>H4 — Gas Calculator Data</H4>
            <Text variant="body-lg">Body Large — The main text for descriptions, paragraphs, and introductions. Inter Regular.</Text>
            <Text variant="body" color="muted">Body — Muted body text for secondary information. Clean and readable at all sizes.</Text>
            <Text variant="caption" color="muted">Caption — Small print, timestamps, metadata labels</Text>
            <H1 gradient>Gradient Heading с брендом</H1>
          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section title="Button Components">
          {/* Primary */}
          <div className="mb-6">
            <Label className="block mb-3">Primary</Label>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary" leftIcon={<Zap size={16} />}>Default</Button>
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={16} />}>Large</Button>
              <Button size="md" variant="primary" loading={loading} onClick={handleLoad}>
                {loading ? 'Загрузка...' : 'Нажми меня'}
              </Button>
              <Button size="md" variant="primary" disabled>Disabled</Button>
            </div>
          </div>

          {/* Secondary */}
          <div className="mb-6">
            <Label className="block mb-3">Secondary</Label>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm" variant="secondary">Small</Button>
              <Button size="md" variant="secondary" leftIcon={<TrendingUp size={16} />}>Default</Button>
              <Button size="lg" variant="secondary">Large</Button>
              <Button size="md" variant="secondary" disabled>Disabled</Button>
            </div>
          </div>

          {/* Outline */}
          <div className="mb-6">
            <Label className="block mb-3">Outline</Label>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm" variant="outline">Small</Button>
              <Button size="md" variant="outline" leftIcon={<BarChart2 size={16} />}>Default</Button>
              <Button size="lg" variant="outline">Large</Button>
              <Button size="md" variant="outline" disabled>Disabled</Button>
            </div>
          </div>

          {/* Ghost + Danger */}
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" leftIcon={<AlertCircle size={16} />}>Danger</Button>
          </div>
        </Section>

        {/* ── INPUTS ── */}
        <Section title="Input Fields">
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              hint="We'll never share your email"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button onClick={() => setShowPass(p => !p)} className="cursor-pointer">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Search"
              type="search"
              placeholder="Search calculations..."
              leftIcon={<Search size={16} />}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <Input
              label="Gas volume (м³)"
              type="number"
              placeholder="0.00"
              leftIcon={<Droplets size={16} />}
              error="Введите корректное значение"
            />
            <Input
              label="Disabled field"
              placeholder="Cannot edit"
              disabled
              leftIcon={<Lock size={16} />}
            />
            <Input
              size="lg"
              label="Large input"
              placeholder="Larger field for key data"
              leftIcon={<DollarSign size={16} />}
            />
          </div>
        </Section>

        {/* ── CARDS ── */}
        <Section title="Card Components">
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            {/* Elevated */}
            <Card variant="elevated" hoverable>
              <Card.Header divider>
                <Card.Title>Elevated Card</Card.Title>
                <Card.Description>Основная карточка с тенью</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text variant="body-sm" color="muted">
                  Используется для основного контента и блоков с данными.
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button size="sm" variant="primary">Подробнее</Button>
              </Card.Footer>
            </Card>

            {/* Outlined */}
            <Card variant="outlined" hoverable>
              <Card.Header divider>
                <Card.Title>Outlined Card</Card.Title>
                <Card.Description>Карточка с контуром</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text variant="body-sm" color="muted">
                  Для вторичного контента или списков.
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button size="sm" variant="outline">Открыть</Button>
              </Card.Footer>
            </Card>

            {/* Flat */}
            <Card variant="flat">
              <Card.Header divider>
                <Card.Title>Flat Card</Card.Title>
                <Card.Description>Без объёма</Card.Description>
              </Card.Header>
              <Card.Body>
                <Text variant="body-sm" color="muted">
                  Минималистичная карточка для плоских секций.
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button size="sm" variant="ghost">Детали</Button>
              </Card.Footer>
            </Card>
          </div>

          {/* Glass card */}
          <div className="gradient-dark rounded-2xl p-8">
            <Card variant="glass" padding="lg">
              <Card.Header divider>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap size={20} className="text-primary" />
                  </div>
                  <div>
                    <Card.Title>Glass Card</Card.Title>
                    <Card.Description>Glassmorphism — на тёмном фоне</Card.Description>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="flex gap-6">
                <div>
                  <Text variant="overline" color="muted" as="span">Экономия</Text>
                  <H3 className="text-secondary mt-1">₽42,800</H3>
                </div>
                <div>
                  <Text variant="overline" color="muted" as="span">Расход</Text>
                  <H3 className="mt-1">1,250 м³</H3>
                </div>
              </Card.Body>
              <Card.Footer align="between">
                <div className="flex items-center gap-1.5 text-secondary">
                  <CheckCircle2 size={16} />
                  <Text variant="body-sm" color="secondary" as="span">Данные актуальны</Text>
                </div>
                <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                  Подробнее
                </Button>
              </Card.Footer>
            </Card>
          </div>
        </Section>

        {/* ── SHADOWS ── */}
        <Section title="Shadows & Elevation">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {['shadow-sm','shadow-md','shadow-lg','shadow-xl'].map(s => (
              <div key={s} className={`bg-surface rounded-xl p-6 ${s} flex flex-col gap-2`}>
                <Code inline>{s}</Code>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="border-t border-surface-200 py-8 text-center">
        <Text variant="body-sm" color="muted">
          GasCalculator Design System · Built with Inter + Tailwind CSS v3
        </Text>
      </div>
    </div>
  );
}
