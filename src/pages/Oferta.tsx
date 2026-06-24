import { BackButton } from '../shared/ui/BackButton';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-2">{title}</h2>
    <div className="text-sm text-olive-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

export const Oferta = () => (
  <div className="max-w-screen-md mx-auto px-4 py-4 pb-24">
    <BackButton label="Назад" />
    <div className="text-xs text-olive-700 mb-4">Главная / <span className="text-olive-500">Публичная оферта</span></div>
    <h1 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Публичная оферта</h1>

    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <p className="text-xs text-olive-600 mb-6">Дата публикации: июнь 2026 года</p>

      <Section title="1. Общие положения">
        <p>Настоящая публичная оферта (далее — «Оферта») является официальным предложением ООО «Мобильные технологии» (далее — «Продавец») заключить договор розничной купли-продажи товаров через Telegram Mini App SkyDefence.</p>
        <p>Акцептом настоящей Оферты является оформление заказа через приложение.</p>
      </Section>

      <Section title="2. Предмет договора">
        <p>Продавец обязуется передать в собственность Покупателя товары, представленные в каталоге приложения, а Покупатель обязуется принять и оплатить их.</p>
        <p>Ассортимент, цены и наличие товаров определяются актуальным каталогом приложения.</p>
      </Section>

      <Section title="3. Цены и оплата">
        <p>Цены указаны в рублях РФ и включают НДС (если применимо).</p>
        <p>Оплата производится следующими способами:</p>
        <ul className="list-disc list-inside space-y-1 text-olive-500">
          <li>Безналичный перевод по реквизитам</li>
          <li>Оплата при получении (наложенный платёж для юридических лиц — по договорённости)</li>
        </ul>
        <p>Продавец вправе изменять цены без предварительного уведомления. Цена фиксируется в момент подтверждения заказа.</p>
      </Section>

      <Section title="4. Доставка">
        <p>Доставка осуществляется транспортными компаниями СДЭК и Почта России по всей территории Российской Федерации.</p>
        <p>Срок доставки: 1–14 рабочих дней в зависимости от региона.</p>
        <p>Бесплатная доставка при заказе от 50 000 ₽.</p>
      </Section>

      <Section title="5. Возврат и обмен">
        <p>Возврат товара надлежащего качества возможен в течение 7 дней с момента получения при сохранении товарного вида и комплектности.</p>
        <p>Возврат товара ненадлежащего качества осуществляется в соответствии с Законом РФ «О защите прав потребителей».</p>
        <p>Для оформления возврата обратитесь по телефону <span className="text-olive-300">+7 (495) 136-5777</span> или на email <span className="text-olive-300">info@skydefence.ru</span>.</p>
      </Section>

      <Section title="6. Гарантия">
        <p>Гарантийный срок на товары определяется производителем и указан в соответствующей документации. Гарантийное обслуживание осуществляется через авторизованные сервисные центры.</p>
      </Section>

      <Section title="7. Ответственность">
        <p>Продавец не несёт ответственности за ненадлежащее использование товаров Покупателем, а также за задержки доставки, вызванные действиями транспортных компаний.</p>
      </Section>

      <Section title="8. Реквизиты продавца">
        <p>ООО «Мобильные технологии»</p>
        <p>ИНН: <span className="text-olive-300">7743412649</span></p>
        <p>КПП: <span className="text-olive-300">771401001</span></p>
        <p>ОГРН: <span className="text-olive-300">1237700190420</span></p>
        <p>Юридический адрес: <span className="text-olive-300">125167, г. Москва, Новый Зыковский проезд, д. 3, пом. 19Ц</span></p>
        <p>Расчётный счёт: <span className="text-olive-300">40702810902540005273</span></p>
        <p>Банк: <span className="text-olive-300">АО «Альфа-Банк»</span>, БИК 044525593</p>
        <p>Корр. счёт: <span className="text-olive-300">30101810200000000593</span></p>
        <p>Email: <span className="text-olive-300">info@skydefence.ru</span></p>
        <p>Телефон: <span className="text-olive-300">+7 (495) 136-5777</span></p>
        <p>Сайт: <span className="text-olive-300">sky-defence.ru</span></p>
      </Section>
    </div>
  </div>
);
