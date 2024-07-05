import { WixMediaImage } from '@app/components/Image/WixMediaImage';
import { formatDate } from '@app/utils/date-formatter';
import { TicketsTable } from '@app/components/Table/Table.client';
import { getWixClient } from '@app/hooks/useWixClientServer';
import { wixEventsV2 as wixEvents } from '@wix/events';
import { Schedule } from '@app/components/Schedule/Schedule';
import { TicketDefinitionExtended } from '@app/types/ticket';
import testIds from '@app/utils/test-ids';

export default async function EventPage({ params }: any) {
  if (!params.slug) {
    return;
  }
  const wixClient = await getWixClient();
  const { items: events } = await wixClient.wixEvents
    .queryEvents({
      fields: [
        wixEvents.RequestedFields.DETAILS,
        wixEvents.RequestedFields.TEXTS,
        wixEvents.RequestedFields.REGISTRATION,
        wixEvents.RequestedFields.AGENDA,
      ],
    })
    .limit(1)
    .eq('slug', decodeURIComponent(params.slug))
    .find();
  const event = events?.length ? events![0] : null;

  const tickets =
    event &&
    ((
      await wixClient.eventOrders.queryAvailableTickets({
        filter: { eventId: event._id },
        offset: 0,
        limit: 100,
        sort: 'orderIndex:asc',
      })
    ).definitions?.map((ticket) => ({
      ...ticket,
      canPurchase:
        ticket.limitPerCheckout! > 0 &&
        (!ticket.salePeriod ||
          (new Date(ticket.salePeriod.endDate!) > new Date() &&
            new Date(ticket.salePeriod.startDate!) < new Date())),
    })) as TicketDefinitionExtended[]);
  const schedule =
    event &&
    (await wixClient.schedule.listScheduleItems({
      eventId: [event._id!],
      limit: 100,
    }));

  return (
    <div className="mx-auto px-4 sm:px-14">
      {event ? (
        <div
          className="full-w overflow-hidden max-w-6xl mx-auto"
          data-testid={testIds.TICKET_DETAILS_PAGE.CONTAINER}
        >
          <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900 text-white max-w-6xl sm:max-w-5xl items-lef sm:items-center mx-auto">
            <div className="basis-1/2">
              <WixMediaImage
                media={event.mainImage}
                width={530}
                height={530}
                className="max-h-[320px] sm:h-[530px] sm:max-h-[530px]"
              />
            </div>
            <div className="basis-1/2 text-left px-5 pb-4">
              <span>
                {formatDate(
                  new Date(event.dateAndTimeSettings?.startDate!),
                  event!.dateAndTimeSettings?.timeZoneId!
                ) || event.dateAndTimeSettings?.formatted?.startDate}{' '}
                | {event.location?.name}
              </span>
              <h1
                data-testid={testIds.TICKET_DETAILS_PAGE.HEADER}
                className="text-3xl sm:text-5xl my-2"
              >
                {event.title}
              </h1>
              <h3 className="my-4 sm:my-6">{event.shortDescription}</h3>
              {event.registration?.status ===
                wixEvents.RegistrationStatusStatus.OPEN_TICKETS && (
                <a
                  className="btn-main inline-block w-full sm:w-auto text-center"
                  href={`/events/${event.slug}#tickets`}
                >
                  Comprar Entradas
                </a>
              )}
              {event.registration?.status ===
                wixEvents.RegistrationStatusStatus.OPEN_EXTERNAL && (
                <a
                  className="btn-main inline-block w-full sm:w-auto text-center"
                  href={event.registration.external!.url!}
                >
                  Comprar Entradas
                </a>
              )}
              {[
                wixEvents.RegistrationStatusStatus.CLOSED_MANUALLY,
                wixEvents.RegistrationStatusStatus.CLOSED_AUTOMATICALLY,
              ].includes(event.registration?.status!) && (
                <div>
                  <p className="border-2 inline-block p-3">
                    Sold out
                    <br />
                    <a href="/" className="underline">
                      Ver otros conciertos
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-[14px] sm:text-base px-3 sm:px-0">
            <h2 className="mt-7">FECHA & LUGAR</h2>
            <p className="font-helvetica">
              {event.dateAndTimeSettings?.formatted?.dateAndTime}
            </p>
            <p className="font-helvetica">
              {
                // @ts-ignore
                event.location?.address?.formatted!
              }
            </p>
            {event.detailedDescription! !== '<p></p>' ? (
              <>
                <h2 className="mt-7">SOBRE EL EVENTO</h2>
                <div
                  className="font-helvetica"
                  dangerouslySetInnerHTML={{
                    __html: event.detailedDescription! ?? '',
                  }}
                />
              </>
            ) : null}
            {schedule?.items?.length ? (
              <div className="mb-4 sm:mb-14">
                <h2 className="mt-7">SCHEDULE</h2>
                <Schedule items={schedule.items} slug={event.slug!} />
              </div>
            ) : null}
            {event.registration?.external && (
              <a
                className="btn-main my-10 inline-block"
                href={event.registration?.external.url!}
              >
                Comprar Entradas
              </a>
            )}
            {[
              wixEvents.RegistrationStatusStatus.CLOSED_MANUALLY,
              wixEvents.RegistrationStatusStatus.OPEN_TICKETS,
            ].includes(event.registration?.status!) && (
              <div className="my-4 sm:my-10">
                <h2 className="mt-7">ENTRADAS</h2>
                <TicketsTable tickets={tickets!} event={event} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-3xl w-full text-center p-9 box-border">
          El evento no ha sido encontrado
        </div>
      )}
    </div>
  );
}

export async function generateStaticParams(): Promise<{ slug?: string }[]> {
  const wixClient = await getWixClient();
  return wixClient.wixEvents
    .queryEvents({})
    .limit(10)
    .ascending('dateAndTimeSettings.startDate')
    .find()
    .then(({ items: events }) => {
      return events!.map((event) => ({
        slug: event.slug,
      }));
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
}
