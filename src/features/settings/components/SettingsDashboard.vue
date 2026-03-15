<script setup lang="ts">
  import BilingualStack from "@/components/BilingualStack.vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import PlatformStatRow from "@/components/platform/PlatformStatRow.vue";      
  import SettingsSegmentedControl from "@/features/settings/components/SettingsSegmentedControl.vue";
  import { useSettingsDashboard } from "@/features/settings/composables/useSettingsDashboard";                                                                  
  
  const {
    hasHydrated,
    previewTemperature,
    previewTime,
    previewWind,
    previewPressure,
    previewVisibility,
    reducedMotionLabel,
    reducedMotionOptions,
    reducedMotionSelection,
    temperatureOptions,
    temperatureUnit,
    timezoneOptions,
    timezonePolicy,
    timeFormatOptions,
    timeFormat,
    pressureOptions,
    pressureUnit,
    visibilityOptions,
    visibilityUnit,
    updateReducedMotion,
    updateTemperatureUnit,
    updateTimezonePolicy,
    updateTimeFormat,
    updatePressureUnit,
    updateVisibilityUnit,
    updateWindUnit,
    updateWorkspaceDefaultGroup,
    windOptions,
    windUnit,
    workspaceDefaultGroup,
    workspaceGroupOptions,
  } = useSettingsDashboard();
</script>

<template>
  <main class="container relative z-10 min-h-screen pt-28 pb-20 sm:pt-32 md:pt-40 md:pb-28">
    <section class="max-w-6xl">
      <BilingualStack
        en="Settings"
        zh="系统偏好设置"
        wrapper-class="flex flex-col gap-3"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.38em] font-bold text-brand-muted/75"
        zh-class="text-lg md:text-xl font-zh-weight tracking-[0.08em]"
      />

      <div class="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
        <div class="space-y-4">
          <p data-testid="settings-heading" class="text-5xl md:text-7xl font-light tracking-tighter">
            Platform preferences are now durable and visible.
          </p>
          <p class="text-3xl md:text-5xl font-zh-weight tracking-tight text-brand-muted/88">
            平台偏好现在已经可持久保存，并真正作用到界面上。
          </p>
          <div class="max-w-3xl text-sm md:text-base leading-7 text-brand-muted/70 space-y-2 mt-4">
            <p>
              Units, timezone policy, layout density, and workspace defaults now seamlessly flow everywhere.
            </p>
            <p>
              全局支持精细化调整。从温度风速到气压能见度制式，所有的偏好都在本地长久保存，并无缝生效。
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PlatformStatRow label="Preview Temp" :value="previewTemperature" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-temperature" class="sr-only">{{ previewTemperature }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow label="Preview Wind" :value="previewWind" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-wind" class="sr-only">{{ previewWind }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow label="Preview Press" :value="previewPressure" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-pressure" class="sr-only">{{ previewPressure }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow label="Preview Vis" :value="previewVisibility" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-visibility" class="sr-only">{{ previewVisibility }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow label="Preview Time" :value="previewTime" tone="elevated" class="sm:col-span-2">
            <template #default>
              <span data-testid="settings-preview-time" class="sr-only">{{ previewTime }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow
            label="Storage State"
            :value="hasHydrated ? 'Ready / 已同步' : 'Pending / 待加载'"        
            tone="elevated"
            class="sm:col-span-2"
          />
        </div>
      </div>
    </section>

    <!-- Units Group -->
    <section class="mt-16 max-w-6xl">
      <div class="mb-6 pb-2 border-b border-brand-primary/10">
        <p class="text-sm uppercase tracking-[0.2em] font-medium text-brand-primary/60">Measurements & Units / 度量单位</p>
      </div>
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SettingsSegmentedControl
          label="Temperature / 温度单位"
          description-en="Visible weather temperatures can stay in Celsius or convert into Fahrenheit."
          description-zh="温度在支持的面板中可以保持摄氏度或转化为华氏度显示。"
          test-id="temperature-unit-toggle"
          :value="temperatureUnit"
          :options="temperatureOptions"
          @change="updateTemperatureUnit"
        />
        <SettingsSegmentedControl
          label="Wind Dynamics / 风速展示"
          description-en="Choose between the compact wind scale language, km/h, or mph."
          description-zh="从紧凑的风口等级、每小时公里或英里中选择界面风力计量方式。"
          test-id="wind-unit-toggle"
          :value="windUnit"
          :options="windOptions"
          @change="updateWindUnit"
        />
        <SettingsSegmentedControl
          label="Atmospheric Pressure / 气压制式"
          description-en="Standard hPa or Imperial inHg."
          description-zh="系统内提供百帕(hPa)与英寸汞(inHg)的展示。"
          test-id="pressure-unit-toggle"
          :value="pressureUnit"
          :options="pressureOptions"
          @change="updatePressureUnit"
        />
        <SettingsSegmentedControl
          label="Visibility Range / 能见度单位"
          description-en="Set visual distance measurement conventions."
          description-zh="设定公里与英里以规范展示极限能见范围。"
          test-id="visibility-unit-toggle"
          :value="visibilityUnit"
          :options="visibilityOptions"
          @change="updateVisibilityUnit"
        />
      </div>
    </section>

    <!-- Localization & Layout Group -->
    <section class="mt-16 max-w-6xl">
      <div class="mb-6 pb-2 border-b border-brand-primary/10">
        <p class="text-sm uppercase tracking-[0.2em] font-medium text-brand-primary/60">Experience & Layout / 本地化与动效</p>
      </div>
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SettingsSegmentedControl
          label="Timezone Strategy / 时区策略"
          description-en="Observation and forecast timestamps can follow the location itself or the current device."
          description-zh="决定天气的时间线参考本地还是当前的设备网络。"
          test-id="timezone-policy-toggle"
          :value="timezonePolicy"
          :options="timezoneOptions"
          @change="updateTimezonePolicy"
        />
        <SettingsSegmentedControl
          label="Clock Format / 腕表格式"
          description-en="Display times in 12-hour AM/PM or standard 24-hour style."
          description-zh="以包含12小时或更紧凑的24小时制渲染页面里的所有的时刻流。"
          test-id="time-format-toggle"
          :value="timeFormat"
          :options="timeFormatOptions"
          @change="updateTimeFormat"
        />
        <SettingsSegmentedControl
          label="Workspace Entry / 工作台默认分组"
          description-en="When opening the orchestration platform, this default lane takes over."
          description-zh="回到平台默认应用路由时，将会加载的数据聚合车道。"
          test-id="workspace-default-group-toggle"
          :value="workspaceDefaultGroup"
          :options="workspaceGroupOptions"
          @change="updateWorkspaceDefaultGroup"
        />
        <SettingsSegmentedControl
          label="Motion & Animation / 动效偏好"
          description-en="Motion can follow the browser, be reduced explicitly, or remain full."
          description-zh="定义应用交互状态并映射相应的动画与过度时长。"
          test-id="reduced-motion-toggle"
          :value="reducedMotionSelection"
          :options="reducedMotionOptions"
          @change="updateReducedMotion"
        />

        <PlatformPanel class="px-5 py-6 md:px-6 md:py-7 xl:col-span-2">
          <p class="text-[10px] uppercase tracking-[0.32em] font-bold text-brand-muted/70">Motion State / 动效状态测定</p>
          <p class="mt-4 text-xl md:text-2xl font-light tracking-tight">
            {{ reducedMotionLabel }}
          </p>
          <div class="mt-5 text-sm leading-7 text-brand-muted/68 space-y-2">      
            <p>
              The browser preference still wins when it asks for reduced motion; the explicit “off” option only restores motion when the browser itself allows it.
            </p>
            <p>
              浏览器如果已经请求降低动效，页面不会被设置项强行恢复；“关闭”只会在浏览器允许完整动效时生效。
            </p>
          </div>
        </PlatformPanel>
      </div>
    </section>
  </main>
</template>
