import { BackButton } from '../shared/ui/BackButton';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-2">{title}</h2>
    <div className="text-sm text-olive-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

export const Politika = () => (
  <div className="max-w-screen-md mx-auto px-4 py-4 pb-24">
    <BackButton label="Назад" />
    <div className="text-xs text-olive-700 mb-4">Главная / <span className="text-olive-500">Политика конфиденциальности</span></div>
    <h1 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Политика конфиденциальности</h1>

    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <p className="text-xs text-olive-600 mb-6">Дата вступления в силу: 1 января 2025 года</p>

      <Section title="1. Общие положения">
        <p>ИП Баев С.А. (далее — «Оператор») обязуется соблюдать конфиденциальность персональных данных пользователей Telegram Mini App SkyDefence.</p>
        <p>Настоящая политика разработана в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».</p>
      </Section>

      <Section title="2. Собираемые данные">
        <p>При использовании приложения мы получаем следующие данные:</p>
        <ul className="list-disc list-inside space-y-1 text-olive-500">
          <li>Имя и фамилия из профиля Telegram</li>
          <li>Имя пользователя Telegram (username)</li>
          <li>Telegram ID</li>
          <li>Номер телефона (при оформлении заказа или заявки)</li>
          <li>Данные об оформленных заказах и заявках</li>
        </ul>
      </Section>

      <Section title="3. Цели обработки">
        <p>Данные используются исключительно для:</p>
        <ul className="list-disc list-inside space-y-1 text-olive-500">
          <li>Обработки заказов и B2B-заявок</li>
          <li>Связи с покупателем по вопросам заказа</li>
          <li>Улучшения качества обслуживания</li>
        </ul>
      </Section>

      <Section title="4. Передача третьим лицам">
        <p>Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также транспортным компаниям для доставки заказа.</p>
      </Section>

      <Section title="5. Хранение данных">
        <p>Данные хранятся на защищённых серверах на территории Российской Федерации. Срок хранения — не более 3 лет с момента последней операции.</p>
      </Section>

      <Section title="6. Права пользователя">
        <p>Вы вправе запросить удаление, исправление или получение копии своих данных. Для этого обратитесь по адресу: <span className="text-olive-300">info@skydefence.ru</span></p>
      </Section>

      <Section title="7. Контакты">
        <p>ИП Баев С.А.</p>
        <p>Email: <span className="text-olive-300">info@skydefence.ru</span></p>
        <p>Телефон: <span className="text-olive-300">+7 (495) 136-5777</span></p>
      </Section>
    </div>
  </div>
);
