import { Button, Input, FormField, Card, Badge, Select, Checkbox, VideoPlayer } from '@talentbase/design-system';

export default function ComponentsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Design System Components</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-4">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
        <div className="max-w-md space-y-4">
          <FormField label="Email">
            <Input type="email" placeholder="seu@email.com" />
          </FormField>
          <FormField label="Password">
            <Input type="password" />
          </FormField>
          <FormField label="Posição">
            <Select options={[
              { value: 'SDR/BDR', label: 'SDR/BDR' },
              { value: 'AE/Closer', label: 'Account Executive/Closer' },
              { value: 'CSM', label: 'Customer Success Manager' },
            ]} />
          </FormField>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cards & Badges</h2>
        <Card className="max-w-md">
          <h3 className="text-xl font-semibold mb-2">Candidate Profile</h3>
          <p className="text-gray-600">João Silva - SDR/BDR</p>
          <Badge variant="success" className="mt-4">Disponível</Badge>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Checkboxes</h2>
        <div className="space-y-2">
          <Checkbox label="HubSpot" />
          <Checkbox label="Salesforce" />
          <Checkbox label="Apollo.io" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Video Player</h2>
        <div className="max-w-2xl">
          <VideoPlayer url="https://youtube.com/watch?v=dQw4w9WgXcQ" />
        </div>
      </section>
    </div>
  );
}
