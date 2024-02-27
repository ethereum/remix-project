
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = true;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the pipeline is loaded.
 */
class CodeCompletionPipeline {
  static task = 'text-generation';
  static model = null
  static instance = null;
    
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  console.log("worker message ", event.data)
  const {
    id, model, text, max_new_tokens, cmd,

    // Generation parameters
    temperature,
    top_k,
    do_sample,
  } = event.data;

  if (cmd === 'init') {
    // Retrieve the code-completion pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    CodeCompletionPipeline.model = model
    await CodeCompletionPipeline.getInstance(x => {
      // We also add a progress callback to the pipeline so that we can
      // track model loading.
      self.postMessage(x);
    });
    return
  }

  if (!CodeCompletionPipeline.instance) {
    // Send the output back to the main thread
    self.postMessage({
      id,
      status: 'error',
      message: 'model not yet loaded'
    });  
  }

  if (cmd === 'suggest') {
    // Retrieve the code-completion pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let generator = await CodeCompletionPipeline.getInstance(x => {
      // We also add a progress callback to the pipeline so that we can
      // track model loading.
      self.postMessage(x);
    });

    // Actually perform the code-completion
    let output = await generator(text, {
      max_new_tokens,
      temperature,
      top_k,
      do_sample,

      // Allows for partial output
      callback_function: x => {
        /*self.postMessage({
          id,
          status: 'update',
          output: generator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
        });
        */
      }
    });

    // Send the output back to the main thread
    self.postMessage({
      id,
      status: 'complete',
      output: output,
    });   
  }
});