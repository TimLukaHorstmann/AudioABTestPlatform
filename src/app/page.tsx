"use client";

import {useState, useCallback, ChangeEvent, useEffect, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Slider} from '@/components/ui/slider';
import {useToast} from '@/hooks/use-toast';
import {Toaster} from '@/components/ui/toaster';
import {Icons} from '@/components/icons';
import {Separator} from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {Progress} from '@/components/ui/progress';
import {
  exportToCsv,
  getAllRatings,
  saveRating,
  saveUserInfo,
} from '@/services/rating-service';
import {UserInfo} from '@/ai/db/schema';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {fetchAudioFiles} from '@/services/audio-service';
import {fetchDriveAudioFiles} from '@/services/drive-service';
import Image from 'next/image';

// Define the type based on the return value of getAllRatings()
type RatingEntry = {
  userId: string;
  userInfo?: { name: string; email: string; };
  audioA: string;
  audioB: string;
  rating: {
    audioA: string;
    audioB: string;
    ratingA: number;
    ratingB: number;
  };
};

const PasswordPage = () => {
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const {toast} = useToast();
  // Minimal config state for admin info only
  const [config, setConfig] = useState<{
    adminName?: string;
    adminEmail?: string;
  }>({});

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on the password input when the component mounts
    passwordInputRef.current?.focus();
  }, []);

  // Update handlePasswordSubmit to authenticate via API
  const handlePasswordSubmit = async () => {
    try {
      setLoginError(null);
      
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          name,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setIsDeveloper(data.isDeveloper);
        
        if (data.isDeveloper) {
          // Store admin info if user is developer
          setConfig({
            adminName: data.adminName,
            adminEmail: data.adminEmail,
          });
          toast({
            title: 'Developer login successful!',
            description: `Welcome, ${name}!`,
          });
        } else {
          // Regular user login
          const userInfo: UserInfo = {name, email};
          await saveUserInfo(email, userInfo); // Use email as userId
          toast({
            title: 'Login successful!',
            description: `Welcome, ${name}!`,
          });
        }
      } else {
        setIsAuthenticated(false);
        setIsDeveloper(false);
        setLoginError(data.error || 'Invalid credentials');
        toast({
          title: 'Login failed',
          description: data.error || 'Incorrect credentials.',
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setLoginError('Authentication failed. Please try again.');
      toast({
        title: 'Login failed',
        description: 'Authentication failed. Please try again.',
      });
    }
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image
                src="https://www.hi-paris.fr/wp-content/uploads/2020/09/logo-hi-paris-retina.png"
                alt="Hi! Paris Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
              <span>Enter Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleEnterKeyPress}
                ref={passwordInputRef}
              />
            </div>
            {loginError && <p className="text-red-500">{loginError}</p>}
            <Button onClick={handlePasswordSubmit}>Submit</Button>
            
            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Demo Credentials</h3>
              
              <div className="space-y-3">
                <div className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-600">Regular User:</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        setName('Test User');
                        setEmail('user@example.com');
                        setPassword('demo');
                      }}
                    >
                      Fill Form
                    </Button>
                  </div>
                  <div className="font-mono text-gray-800 space-y-1">
                    <div>Name: <span className="bg-white px-1 rounded">Any name</span></div>
                    <div>Email: <span className="bg-white px-1 rounded">Any email</span></div>
                    <div>Password: <span className="bg-white px-1 rounded">demo</span></div>
                  </div>
                </div>
                
                <div className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-600">Admin User:</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        setName('admin');
                        setEmail('admin@tts.com');
                        setPassword('admin');
                      }}
                    >
                      Fill Form
                    </Button>
                  </div>
                  <div className="font-mono text-gray-800 space-y-1">
                    <div>Name: <span className="bg-white px-1 rounded">admin</span></div>
                    <div>Email: <span className="bg-white px-1 rounded">admin@tts.com</span></div>
                    <div>Password: <span className="bg-white px-1 rounded">admin</span></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                💡 Admin users can export results and see additional analytics
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AudioRaterApp 
    isDeveloper={isDeveloper} 
    userEmail={email} 
    userName={name} 
    config={config}  // Pass the config as a prop
  />;
};

const AudioRaterApp = ({
  isDeveloper,
  userEmail,
  userName,
  config,  // Add config to props
}: {
  isDeveloper: boolean;
  userEmail: string;
  userName: string;
  config: {  // Define the config type
    adminName?: string;
    adminEmail?: string;
  };
}) => {
  const [audioPairs, setAudioPairs] = useState<[string, string, string, boolean][]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [ratings, setRatings] = useState<{ a: number; b: number }[]>([]);
  const {toast} = useToast();
  const [ratedPairs, setRatedPairs] = useState<number[]>([]);
  const [tempRatings, setTempRatings] = useState<{ a: number; b: number }>({
    a: 0,
    b: 0,
  }); // Temporary ratings before submission
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [allRatings, setAllRatings] = useState<RatingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false); // State to track test completion

  useEffect(() => {
    const loadAudioFiles = async () => {
      setAudioLoading(true);
      setAudioError(null); // Clear any previous errors
      
      try {
        // Only use local files - remove Google Drive fetch
        const localFiles = await fetchAudioFiles();
        
        if (localFiles && localFiles.length > 0) {
          setAudioPairs(localFiles);
        } else {
          setAudioError('No audio files found.');
          toast({
            title: 'No audio files found',
            description: 'Please check the audio files.'
          });
        }
      } catch (error) {
        console.error('Error loading audio files:', error);
        setAudioError('Failed to load audio files.');
        toast({
          title: 'Error loading audio files',
          description: 'Failed to load audio files. Please try again.'
        });
      } finally {
        setAudioLoading(false);
      }
    };

    loadAudioFiles();
  }, [toast]);

  useEffect(() => {
    loadInitialRatings();
  }, [userEmail, audioPairs]);

  const loadInitialRatings = async () => {
    setLoading(true);
    try {
      const loadedRatings = await getAllRatings();
      setAllRatings(loadedRatings);

      // Initialize ratings state with existing ratings for the current user
      const initialRatings = audioPairs.map(([audioA, audioB, audioName]) => {
        const existingRating = loadedRatings.find(
          rating =>
            rating.userId === userEmail &&
            rating.audioA === audioA &&
            rating.audioB === audioB
        )?.rating;
        return existingRating ? {a: existingRating.ratingA, b: existingRating.ratingB} : {a: 0, b: 0};
      });

      setRatings(initialRatings);
      setRatedPairs(
        initialRatings.reduce((acc: number[], rating, index) => {
          if (rating.a > 0 && rating.b > 0) {
            acc.push(index);
          }
          return acc;
        }, [])
      );

      // Set initial temporary ratings if there are existing ratings
      if (initialRatings[currentPairIndex]) {
        setTempRatings({
          a: initialRatings[currentPairIndex].a || 0,
          b: initialRatings[currentPairIndex].b || 0,
        });
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast({
        title: 'Error loading ratings',
        description: 'Failed to load existing ratings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (version: 'a' | 'b', rating: number) => {
    setTempRatings({...tempRatings, [version]: rating});
  };

  const handleSubmitRating = async () => {
    try {
      const {a, b} = tempRatings;
      if (a < 1 || a > 5 || b < 1 || b > 5) {
        toast({
          title: 'Invalid rating',
          description: 'Please rate both versions between 1 and 5.',
        });
        return;
      }

      const [audioA, audioB, audioName, swapped] = audioPairs[currentPairIndex];
      
      // When saving to database, ensure the original file order is maintained
      await saveRating(
        userEmail,
        swapped ? audioB : audioA, // If swapped, audioB is the improved version
        swapped ? audioA : audioB, // If swapped, audioA is the raw version
        {
          ratingA: swapped ? tempRatings.b : tempRatings.a, // Map rating to correct audio
          ratingB: swapped ? tempRatings.a : tempRatings.b  // Map rating to correct audio
        }
      );

      const newRatings = [...ratings];
      newRatings[currentPairIndex] = {a: tempRatings.a, b: tempRatings.b};
      setRatings(newRatings);

      if (!ratedPairs.includes(currentPairIndex)) {
        setRatedPairs([...ratedPairs, currentPairIndex]);
      }

      toast({
        title: 'Rating saved!',
        description: 'Your rating has been successfully saved.',
      });

      setRatingSubmitted(true);
      // Move to the next pair automatically
      const nextIndex = (currentPairIndex + 1) % audioPairs.length;
      handlePairSelect(nextIndex);
    } catch (error: any) {
      console.error('Error submitting rating:', error.message);
      toast({
        title: 'Error saving rating',
        description: 'Failed to save your rating. Please try again.',
      });
    }
  };

  const handlePairSelect = (index: number) => {
    setCurrentPairIndex(index);
    setRatingSubmitted(false);
    setTempRatings({
      a: ratings[index]?.a || 0,
      b: ratings[index]?.b || 0,
    });
  };

  const ratingPercentage =
    audioPairs.length > 0 ? (ratedPairs.length / audioPairs.length) * 100 : 0;

  const currentPair = audioPairs[currentPairIndex];

  const handleExportCsv = async () => {
    try {
      const csvData = await exportToCsv();
      if (!csvData) {
        toast({title: 'No data to export', description: 'No ratings found.'});
        return;
      }
      const blob = new Blob([csvData], {type: 'text/csv'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'audio_ratings.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({title: 'CSV Exported', description: 'Data exported successfully.'});
    } catch (error: any) {
      console.error('CSV Export Error:', error);
      toast({title: 'Export Failed', description: 'Error exporting data.'});
    }
  };

  const handleFinishTest = async () => {
    if (ratedPairs.length === audioPairs.length) {
      setTestCompleted(true);
      
      // Send export email to admin
      try {
        const adminEmail = config.adminEmail || 'tim.horstmann@ip-paris.fr';
        
        const response = await fetch('/api/send-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail: adminEmail,
          }),
        });
        
        if (response.ok) {
          console.log('Export email sent successfully');
        } else {
          console.error('Failed to send export email');
        }
      } catch (error) {
        console.error('Error sending export email:', error);
      }
    } else {
      toast({
        title: 'Cannot finish A/B test',
        description: 'Please rate all audio pairs before finishing.',
      });
    }
  };

  if (isDeveloper) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Developer View - All Ratings</h1>
        <Button onClick={handleExportCsv} className="mb-4">
          Export to CSV
        </Button>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table>
            <TableCaption>A list of all audio ratings in the database.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Audio A</TableHead>
                <TableHead>Audio B</TableHead>
                <TableHead>Rating A</TableHead>
                <TableHead>Rating B</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRatings.map((rating, index) => (
                <TableRow key={index}>
                  <TableCell>{rating.userId}</TableCell>
                  <TableCell>{rating.userInfo?.name}</TableCell>
                  <TableCell>{rating.userInfo?.email}</TableCell>
                  <TableCell>{rating.audioA}</TableCell>
                  <TableCell>{rating.audioB}</TableCell>
                  <TableCell>{rating.rating.ratingA}</TableCell>
                  <TableCell>{rating.rating.ratingB}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Toaster />
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Thank you for your participation in this A/B testing!</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setTestCompleted(false)}>
                Review Ratings
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'https://www.hi-paris.fr/'}>
                Leave Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <CardTitle>Audio Pairs</CardTitle>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {audioPairs.map((pair, index) => (
              <SidebarMenuItem key={index}>
                <Button
                  variant={index === currentPairIndex ? "default" : "ghost"}
                  onClick={() => handlePairSelect(index)}
                  className={`w-full justify-start ${
                    index === currentPairIndex 
                      ? 'bg-accent text-accent-foreground border-l-4 border-primary rounded-l-none' 
                      : 'hover:bg-accent/50'
                  } transition-all duration-200`}
                >
                  <div className="flex items-center w-full">
                    <span className="mr-2 text-sm font-semibold">{index + 1}.</span>
                    <span className="truncate flex-1">{pair[2]}</span>
                    {ratedPairs.includes(index) && (
                      <Icons.check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                </Button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      <div className="md:pl-[16rem] flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-background to-secondary">
        <Toaster />
        
        {/* Header with progress */}
        <div className="w-full max-w-6xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Audio A/B Test</h1>
            <Image
              src="https://www.hi-paris.fr/wp-content/uploads/2020/09/logo-hi-paris-retina.png"
              alt="Hi! Paris Logo"
              width={70}
              height={70}
              className="rounded-full shadow-md"
            />
          </div>
          
          <Card className="p-4 mb-6">
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Your progress</span>
                <span className="text-sm font-medium">{ratedPairs.length}/{audioPairs.length} pairs rated</span>
              </div>
              <Progress value={ratingPercentage} className="h-3" />
            </div>
            
            {currentPair && (
              <p className="text-sm text-muted-foreground">
                Currently rating: <span className="font-semibold">{currentPair[2]}</span>
              </p>
            )}
          </Card>
        </div>
        
        {audioLoading ? (
          <Card className="w-full max-w-6xl p-12 flex justify-center">
            <div className="flex flex-col items-center">
              <Icons.loader className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Loading audio files...</p>
            </div>
          </Card>
        ) : audioError ? (
          <Card className="w-full max-w-6xl p-12 bg-destructive/10">
            <div className="flex flex-col items-center text-destructive">
              <Icons.alertCircle className="h-12 w-12 mb-4" />
              <p className="font-semibold">Error: {audioError}</p>
            </div>
          </Card>
        ) : currentPair ? (
          <Card className="w-full max-w-6xl shadow-lg border-t-4 border-primary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  Audio Pair {currentPairIndex + 1} of {audioPairs.length}
                </CardTitle>
                <span className="text-sm bg-secondary px-3 py-1 rounded-full font-medium">
                  {currentPair[2]}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 pb-8 space-y-8">
              {/* Enhanced Audio Players - Stacked for more space */}
              <div className="space-y-8">
                <EnhancedAudioPlayer 
                  src={`/${currentPair[0]}`} 
                  title="Version A" 
                  rating={tempRatings.a}
                  onRatingChange={(rating) => handleRatingChange('a', rating)}
                />
                
                <Separator className="my-8" />
                
                <EnhancedAudioPlayer 
                  src={`/${currentPair[1]}`} 
                  title="Version B"
                  rating={tempRatings.b} 
                  onRatingChange={(rating) => handleRatingChange('b', rating)}
                />
              </div>
              
              <div className="pt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {ratingSubmitted ? (
                    <div className="flex items-center text-primary">
                      <Icons.check className="mr-2 h-4 w-4" />
                      Rating submitted
                    </div>
                  ) : (
                    "Please rate both versions to continue"
                  )}
                </div>
                
                <div className="space-x-4">
                  {currentPairIndex > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => handlePairSelect(currentPairIndex - 1)}
                      className="gap-2"
                    >
                      <Icons.chevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleSubmitRating} 
                    disabled={ratingSubmitted || tempRatings.a < 1 || tempRatings.b < 1}
                    className="gap-2"
                  >
                    {ratingSubmitted ? 'Submitted' : 'Submit Rating'}
                    {!ratingSubmitted && <Icons.arrowRight className="h-4 w-4" />}
                  </Button>
                  
                  {ratingSubmitted && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handlePairSelect((currentPairIndex + 1) % audioPairs.length)}
                      className="gap-2"
                    >
                      Next Pair
                      <Icons.chevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-6xl p-12">
            <div className="text-center">
              <Icons.audioLines className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No audio pairs available.</p>
            </div>
          </Card>
        )}

        {/* Finish test button - repositioned */}
        <Card className="w-full max-w-6xl mt-6 bg-background/80">
          <CardContent className="flex justify-between items-center p-6">
            <div className="text-sm max-w-md">
              <p className="font-medium">Ready to complete the test?</p>
              <p className="text-muted-foreground">After finishing, your ratings will be submitted for analysis.</p>
            </div>
            <Button 
              onClick={handleFinishTest} 
              disabled={ratedPairs.length !== audioPairs.length}
              size="lg"
              className={`${ratedPairs.length === audioPairs.length ? 'bg-primary hover:bg-primary/90' : ''}`}
            >
              {ratedPairs.length === audioPairs.length ? 'Finish A/B Test' : `Rate ${audioPairs.length - ratedPairs.length} more pairs to finish`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SidebarProvider>
  );
};

const EnhancedAudioPlayer = ({
  src, 
  title,
  rating,
  onRatingChange
}: { 
  src: string; 
  title: string;
  rating: number;
  onRatingChange: (rating: number) => void;
}) => {
  // For Google Drive URLs, use the full URL directly, for local files normalize the path
  const audioSrc = src.startsWith('https://') ? src : src.replace(/\\/g, '/');
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg border border-muted">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-sm">
              {title === "Version A" ? "A" : "B"}
            </span>
            {title}
          </h3>
        </div>
        
        <audio 
          controls 
          src={audioSrc} 
          className="w-full h-12 rounded-md" 
        >
          Your browser does not support the audio element.
        </audio>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Rate this audio:</Label>
          <span className="bg-primary/10 text-primary text-sm font-semibold px-2 py-1 rounded">
            Score: {rating}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Poor</span>
          <Slider
            value={[rating]}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => onRatingChange(value[0])}
            className="flex-1"
          />
          <span className="text-sm font-medium text-muted-foreground">Excellent</span>
        </div>
      </div>
    </div>
  );
};

const AudioPlayer = ({src, title}: { src: string; title: string }) => {
  // For Google Drive URLs, use the full URL directly, for local files normalize the path
  const audioSrc = src.startsWith('https://') ? src : src.replace(/\\/g, '/');
  
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <audio controls src={audioSrc} className="w-full">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

const RatingSelector = ({
  version,
  onChange,
  currentRating,
}: {
  version: 'a' | 'b';
  onChange: (version: 'a' | 'b', rating: number) => void;
  currentRating: number;
}) => {
  return (
    <div className="flex items-center space-x-4">
      <Label className="w-24">Rating (1-5):</Label>
      <Slider
        defaultValue={[currentRating]}
        max={5}
        min={1}
        step={1}
        onValueChange={value => onChange(version, value[0])}
        className="max-w-xs"
      />
      <span>{currentRating}</span>
    </div>
  );
};

export default PasswordPage;
