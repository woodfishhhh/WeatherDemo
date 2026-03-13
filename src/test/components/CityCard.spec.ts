import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CityCard from '@/components/CityCard.vue';

describe('CityCard', () => {
  it('renders current weather details and emits delete with the city id', async () => {
    const wrapper = mount(CityCard, {
      props: {
        city: {
          id: 'city-1',
          city: 'Shanghai',
          weather: {
            lives: [
              {
                province: 'Shanghai',
                weather: 'Cloudy',
                humidity: '60',
                windpower: '3',
                temperature: '26',
              },
            ],
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Shanghai');
    expect(wrapper.text()).toContain('Cloudy');
    expect(wrapper.text()).toContain('26°');

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('delete')).toEqual([['city-1']]);
  });
});
