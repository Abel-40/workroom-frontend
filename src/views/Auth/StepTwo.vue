<script setup lang="ts">
import { WorkflowIcon, ArrowRight, Section } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button/Button.vue'
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@/components/ui/toast/use-toast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { toast } = useToast();

interface CompanyType {
  name: string;
  sector: number;
  owner: string;
}

const companyForm = ref<CompanyType>({
  name: '',
  sector: 0,
  owner: authStore.logedInUserInfo.user.id,
});

const showErrors = ref(false);

onMounted(async () => {
  await authStore.getSectors();
});

const validateForm = (): boolean => {
  return (
    companyForm.value.name.trim() !== '' &&
    companyForm.value.sector > 0 &&
    !!companyForm.value.owner
  );
};

const handleSubmit = async () => {
  showErrors.value = true;

  if (!validateForm()) {
    toast({
      title: 'Form Error',
      description: 'Please fill in all required fields.',
      variant: 'destructive',
    });
    return;
  }

  authStore.updateStep2Form({
    name: companyForm.value.name,
    owner: companyForm.value.owner,
    sector: companyForm.value.sector,
    isStep2Complete: true,
  });

  try {
    const result = await authStore.register_company(authStore.step2Form);

    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        toast({
          title: `Error in ${field}`,
          description: messages.join(', '),
          variant: 'destructive',
        });
      });
    } else if (result.message && !result.company) {
      toast({
        title: 'Registration Failed',
        description: result.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Company registered successfully.',
        variant: 'default',
      });
      router.push({
        path: '/auth/',
        query: { section: 'step3' },
      });
    }
  } catch (error) {
    toast({
      title: 'Unexpected Error',
      description: 'Something went wrong during registration.',
      variant: 'destructive',
    });
    console.error('Company registration error:', error);
  }
};
</script>

<template>
          <!-- Right Container - Form -->
      <div class="w-full lg:w-2/3 xl:w-3/4 px-6 sm:p-8 md:px-12 flex flex-col items-center justify-center bg-white rounded-2xl">
        <div class="w-full max-w-md">
          <!-- Step Indicator -->
          <div class="text-center ">
            <p class="text-sm text-gray-500">STEP 2 OF 4</p>
            <p class="text-gray-500 mt-2">Create your account to get started</p>
          </div>

          <!-- Form -->
          <div class="w-full  flex items-center justify-center px-6 ">
          <Card class="w-full  border-none shadow-none">
            <CardContent class="space-y-5">
              <form @submit.prevent="handleSubmit">
                <!-- Basic Information -->
                <div class="space-y-3">
                  <div class="space-y-1">
                    <Label for="phoneNumber">Company Name</Label>
                    <Input 
                      id="phoneNumber" 
                      type="text"
                      v-model="companyForm.name" 
                      placeholder="Ex: TSLT" 
                    />
                    <p v-if="showErrors && companyForm.name.length<3" class="text-red-500 text-4 md-1">company Name Must Be Greater Than 3</p>
                  </div>
                </div>
                

                <!-- Work Information -->
                <div class="space-y-3 pt-2">
                  <div class="space-y-1">
                    <Label for="department">Sector</Label>
                    <select
                      id="department"
                      v-model="companyForm.sector"
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value=0>Select Department</option>
                      <option 
                        v-for="sector in authStore.sectors" 
                        :key="sector.id" 
                        :value="sector.id"
                      >
                        {{ sector.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <Button type="submit" class="w-full mt-2 bg-[#3F8CFF] hover:bg-[#3F8CFF]/90">
                  Complete Profile <ArrowRight class="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>

            <CardFooter class="justify-center text-sm">
              Already have an account?
              <Button as="a" variant="link" href="/Auth/login/" class="text-[#3F8CFF] p-0 ml-1 h-auto">
                Sign In
              </Button>
            </CardFooter>
          </Card>
        </div>
        </div>
      </div>
</template>