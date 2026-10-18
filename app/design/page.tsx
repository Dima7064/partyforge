import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function DesignPage() {
  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-forge-gold-light mb-2">
          Дизайн-система PartyForge
        </h1>
        <p className="text-forge-muted">
          Песочница компонентов. Здесь смотрим, как всё выглядит.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">Кнопки</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">Карточки</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Кайрен</CardTitle>
              <CardDescription>Паладин, потерявший веру</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-forge-parchment">
                Бывший паладин, убил своего наставника. Ищет искупления.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">Подробнее</Button>
              <Button size="sm" variant="ghost">Перегенерировать</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Мира</CardTitle>
              <CardDescription>Воровка, мечтающая о свободе</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-forge-parchment">
                Работает на гильдию, носит ребёнка от человека, которого должна убить.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">Подробнее</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">Поля ввода</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <Label htmlFor="name">Имя персонажа</Label>
            <Input id="name" placeholder="Введите имя" />
          </div>
          <div>
            <Label htmlFor="class">Класс</Label>
            <Select id="class" defaultValue="">
              <option value="" disabled>Выберите класс</option>
              <option value="fighter">Воин</option>
              <option value="wizard">Маг</option>
              <option value="rogue">Плут</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="backstory">Предыстория</Label>
            <Textarea id="backstory" placeholder="Опишите прошлое персонажа..." rows={4} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">Бейджи</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="gold">Паладин</Badge>
          <Badge variant="ember">Тайна</Badge>
          <Badge variant="muted">3 уровень</Badge>
        </div>
      </section>
    </main>
  );
}