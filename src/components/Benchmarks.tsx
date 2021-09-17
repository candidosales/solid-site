import type { Component } from 'solid-js';
import { useI18n } from '@solid-primitives/i18n';
import { createSignal, createMemo, For, Show } from 'solid-js';

export interface GraphData {
  id: string;
  name: string;
  description: string;
  link: string;
  data: Array<RowData>;
  scale: string;
}
interface RowData {
  label: string;
  active?: boolean;
  score: number;
}

const Chart: Component<{ rows: Array<RowData>; scale: string }> = (props) => {
  const maxValue = createMemo(() => Math.max(...props.rows.map((row) => row.score)));
  const options = createMemo(() =>
    props.rows
      .sort((a, b) => a.score - b.score)
      .map((row) => ({
        ...row,
        width: `${(row.score / maxValue()) * 100}%`,
      })),
  );
  return (
    <table class="w-full table-fixed">
      <tbody>
        <For each={options()}>
          {(row) => {
            return (
              <tr>
                <td class="w-1/6 text-xs">{row.label}</td>
                <td class="w-4/6 py-1">
                  <div
                    class="transition-all duration-75 rounded-3xl ltr:text-right rtl:text-left text-xxs"
                    classList={{
                      'font-semibold': row.active,
                      'bg-solid-accent': row.active,
                      'bg-gray-100': !row.active,
                    }}
                    style={{ width: row.width }}
                  >
                    {row.score ? (
                      <figure>
                        <span class="inline-block p-1 ltr:border-l rtl:border-r border-white px-2 rounded-full">
                          {row.score}
                        </span>
                      </figure>
                    ) : (
                      ''
                    )}
                  </div>
                </td>
              </tr>
            );
          }}
        </For>
        {!options().length ? (
          <tr>
            <td>&nbsp;</td>
            <td colSpan="2">No data has been supplied.</td>
          </tr>
        ) : null}
        <tr>
          <td>&nbsp;</td>
          <td class="p-3 text-xs">{props.scale}</td>
        </tr>
      </tbody>
    </table>
  );
};

const Benchmarks: Component<{ list: Array<GraphData> }> = (props) => {
  const [t] = useI18n();
  const [current, setCurrent] = createSignal(0);
  const [expanded, setExpanded] = createSignal(false);
  const chevron = createMemo(() => t('global.dir', {}, 'ltr') == 'rtl' ? 'chevron-left' : 'chevron-right');
  return (
    <>
      <Chart scale={props.list[current()].scale} rows={props.list[current()].data} />
      <Show
        when={expanded()}
        fallback={
          <button
            class={`py-3 text-sm chevron button text-solid-default font-semibold hover:text-gray-500 ${chevron()}` }
            onClick={() => setExpanded(true)}
          >
            {t('home.benchmarks.show_more', {}, 'Show more client + server benchmarks')}
          </button>
        }
      >
        <div class="flex flex-col xl:flex-row space-y-2">
          {props.list.map((item, index) => {
            return (
              <button
                onClick={() => setCurrent(index)}
                class="text-xs p-4 rounded hover:bg-gray-400 transition duration-150 hover:text-white"
                classList={{
                  'active text-white bg-solid-light': current() === index,
                  'bg-gray-100': current() !== index,
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <div>
          <div class="pt-5 text-xs block">{props.list[current()].description}</div>
          <Show when={props.list[current()].link}>
            <a
              target="_blank"
              class="button text-xs block mt-3 text-solid-default chevron chevron-right font-semibold hover:text-gray-500"
              rel="noopener noreferrer"
              href={props.list[current()].link}
            >
              {t('home.benchmarks.view')}
            </a>
          </Show>
        </div>
      </Show>
    </>
  );
};

export default Benchmarks;
